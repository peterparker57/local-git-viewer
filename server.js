const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Get the database path
const getDbPath = () => {
  const homeDir = os.homedir();
  return path.join(homeDir, 'AppData', 'Local', 'MCP', 'data', 'project_hub', 'project_hub.db');
};

// Database connection
const dbPath = getDbPath();
console.log(`Using database at: ${dbPath}`);

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.error(`Database not found at ${dbPath}`);
  console.error('Please make sure the Project Hub MCP server has been run at least once to create the database.');
}

// Create a new database connection
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Helper function to run SQL queries
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('SQL Error:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// API endpoint to list projects
app.post('/api/mcp/project-hub/list_projects', async (req, res) => {
  try {
    const sql = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.type,
        p.path,
        p.repository_owner as repositoryOwner,
        p.repository_name as repositoryName,
        p.status,
        p.last_commit as lastCommit,
        p.technologies,
        p.created_at as createdAt,
        p.updated_at as updatedAt
      FROM projects p
      ORDER BY p.name
    `;
    
    const projects = await runQuery(sql);
    
    // Format the response to match the MCP server format
    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      type: project.type,
      path: project.path,
      status: project.status,
      lastCommit: project.lastCommit,
      technologies: project.technologies ? JSON.parse(project.technologies) : [],
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      repository: project.repositoryOwner ? {
        owner: project.repositoryOwner,
        name: project.repositoryName
      } : null
    }));
    
    res.json({ projects: formattedProjects });
  } catch (error) {
    console.error('Error listing projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get a project
app.post('/api/mcp/project-hub/get_project', async (req, res) => {
  try {
    const { projectId } = req.body;
    
    const sql = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.type,
        p.path,
        p.repository_owner as repositoryOwner,
        p.repository_name as repositoryName,
        p.status,
        p.last_commit as lastCommit,
        p.technologies,
        p.created_at as createdAt,
        p.updated_at as updatedAt
      FROM projects p
      WHERE p.id = ?
    `;
    
    const projects = await runQuery(sql, [projectId]);
    
    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const project = projects[0];
    
    // Format the response to match the MCP server format
    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      type: project.type,
      path: project.path,
      status: project.status,
      lastCommit: project.lastCommit,
      technologies: project.technologies ? JSON.parse(project.technologies) : [],
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      repository: project.repositoryOwner ? {
        owner: project.repositoryOwner,
        name: project.repositoryName
      } : null
    };
    
    res.json(formattedProject);
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get local commit history
app.post('/api/mcp/project-hub/get_local_commit_history', async (req, res) => {
  try {
    const { projectId } = req.body;
    
    // Get commits
    const commitsSql = `
      SELECT 
        c.id, 
        c.project_id as projectId, 
        c.message, 
        c.author_name as authorName, 
        c.author_email as authorEmail,
        c.timestamp,
        c.parent_commit_id as parentCommitId,
        c.pushed_to_remote as pushedToRemote,
        c.remote_commit_sha as remoteCommitSha
      FROM local_commits c
      WHERE c.project_id = ?
      ORDER BY c.timestamp DESC
    `;
    
    const commits = await runQuery(commitsSql, [projectId]);
    
    // Get changes for each commit
    for (const commit of commits) {
      const changesSql = `
        SELECT
          ch.id,
          ch.project_id as project_id,
          ch.type,
          ch.description,
          ch.timestamp,
          ch.committed
        FROM changes ch
        JOIN commit_changes cc ON ch.id = cc.change_id
        WHERE ch.committed = 1 AND cc.commit_id = ?
      `;
      
      const changes = await runQuery(changesSql, [commit.id]);
      commit.changes = changes;
    }
    
    res.json(commits);
  } catch (error) {
    console.error('Error getting commit history:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get pending changes
app.post('/api/mcp/project-hub/get_pending_changes', async (req, res) => {
  try {
    const { projectId } = req.body;
    
    const sql = `
      SELECT 
        ch.id,
        ch.project_id as project_id,
        ch.type,
        ch.description,
        ch.timestamp,
        ch.committed
      FROM changes ch
      WHERE ch.project_id = ? AND ch.committed = 0
      ORDER BY ch.timestamp DESC
    `;
    
    const changes = await runQuery(sql, [projectId]);
    
    res.json(changes);
  } catch (error) {
    console.error('Error getting pending changes:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to list local branches
app.post('/api/mcp/project-hub/list_local_branches', async (req, res) => {
  try {
    const { projectId } = req.body;
    
    const sql = `
      SELECT 
        b.id,
        b.project_id as projectId,
        b.name,
        b.current_commit_id as currentCommitId,
        b.is_active as isActive
      FROM local_branches b
      WHERE b.project_id = ?
      ORDER BY b.is_active DESC, b.name
    `;
    
    const branches = await runQuery(sql, [projectId]);
    
    res.json(branches);
  } catch (error) {
    console.error('Error listing branches:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to initialize local repository
app.post('/api/mcp/project-hub/init_local_repository', async (req, res) => {
  try {
    const { projectId } = req.body;
    
    // Check if repository already exists
    const checkSql = `
      SELECT COUNT(*) as count
      FROM local_branches
      WHERE project_id = ?
    `;
    
    const result = await runQuery(checkSql, [projectId]);
    
    if (result[0].count > 0) {
      return res.json({ message: 'Repository already initialized' });
    }
    
    // Create main branch
    const branchId = `branch_${Date.now()}`;
    const branchSql = `
      INSERT INTO local_branches (id, project_id, name, is_active)
      VALUES (?, ?, 'main', 1)
    `;
    
    await runQuery(branchSql, [branchId, projectId]);
    
    // Create initial commit
    const commitId = `commit_${Date.now()}`;
    const commitSql = `
      INSERT INTO local_commits (id, project_id, message, author_name, author_email, timestamp, pushed_to_remote)
      VALUES (?, ?, 'Initial commit', 'System', 'system@example.com', datetime('now'), 0)
    `;
    
    await runQuery(commitSql, [commitId, projectId]);
    
    // Update branch to point to commit
    const updateBranchSql = `
      UPDATE local_branches
      SET current_commit_id = ?
      WHERE id = ?
    `;
    
    await runQuery(updateBranchSql, [commitId, branchId]);
    
    res.json({ message: 'Local Git repository initialized successfully' });
  } catch (error) {
    console.error('Error initializing repository:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to create local commit
app.post('/api/mcp/project-hub/create_local_commit', async (req, res) => {
  try {
    const { projectId, message, authorName, authorEmail } = req.body;
    
    // Get pending changes
    const changesSql = `
      SELECT id
      FROM changes
      WHERE project_id = ? AND committed = 0
    `;
    
    const changes = await runQuery(changesSql, [projectId]);
    
    if (changes.length === 0) {
      return res.status(400).json({ error: 'No pending changes to commit' });
    }
    
    // Get active branch
    const branchSql = `
      SELECT id, current_commit_id
      FROM local_branches
      WHERE project_id = ? AND is_active = 1
    `;
    
    const branches = await runQuery(branchSql, [projectId]);
    
    if (branches.length === 0) {
      return res.status(400).json({ error: 'No active branch found' });
    }
    
    const branch = branches[0];
    
    // Create commit
    const commitId = `commit_${Date.now()}`;
    const commitSql = `
      INSERT INTO local_commits (
        id, 
        project_id, 
        message, 
        author_name, 
        author_email, 
        timestamp, 
        parent_commit_id, 
        pushed_to_remote
      )
      VALUES (?, ?, ?, ?, ?, datetime('now'), ?, 0)
    `;
    
    await runQuery(commitSql, [
      commitId, 
      projectId, 
      message, 
      authorName || 'Unknown', 
      authorEmail || '', 
      branch.current_commit_id
    ]);
    
    // Update branch to point to new commit
    const updateBranchSql = `
      UPDATE local_branches
      SET current_commit_id = ?
      WHERE id = ?
    `;
    
    await runQuery(updateBranchSql, [commitId, branch.id]);
    
    // Mark changes as committed
    const updateChangesSql = `
      UPDATE changes
      SET committed = 1
      WHERE project_id = ? AND committed = 0
    `;
    
    await runQuery(updateChangesSql, [projectId]);
    
    // Associate changes with commit in the commit_changes table
    const pendingChangesSql = `
      SELECT id FROM changes
      WHERE project_id = ? AND committed = 1
      AND id NOT IN (SELECT change_id FROM commit_changes)
    `;
    
    const pendingChanges = await runQuery(pendingChangesSql, [projectId]);
    
    for (const change of pendingChanges) {
      await runQuery(
        `INSERT INTO commit_changes (commit_id, change_id) VALUES (?, ?)`,
        [commitId, change.id]
      );
    }
    
    // Get the created commit with changes
    const getCommitSql = `
      SELECT 
        c.id, 
        c.project_id as projectId, 
        c.message, 
        c.author_name as authorName, 
        c.author_email as authorEmail,
        c.timestamp,
        c.parent_commit_id as parentCommitId,
        c.pushed_to_remote as pushedToRemote,
        c.remote_commit_sha as remoteCommitSha
      FROM local_commits c
      WHERE c.id = ?
    `;
    
    const commits = await runQuery(getCommitSql, [commitId]);
    
    if (commits.length === 0) {
      return res.status(500).json({ error: 'Failed to retrieve created commit' });
    }
    
    const commit = commits[0];
    
    // Get changes for the commit
    const getChangesSql = `
      SELECT
        ch.id,
        ch.project_id as project_id,
        ch.type,
        ch.description,
        ch.timestamp,
        ch.committed
      FROM changes ch
      JOIN commit_changes cc ON ch.id = cc.change_id
      WHERE cc.commit_id = ?
    `;
    
    const commitChanges = await runQuery(getChangesSql, [commitId]);
    commit.changes = commitChanges;
    
    res.json(commit);
  } catch (error) {
    console.error('Error creating commit:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to create local branch
app.post('/api/mcp/project-hub/create_local_branch', async (req, res) => {
  try {
    const { projectId, name, startingCommitId } = req.body;
    
    // Check if branch already exists
    const checkSql = `
      SELECT COUNT(*) as count
      FROM local_branches
      WHERE project_id = ? AND name = ?
    `;
    
    const result = await runQuery(checkSql, [projectId, name]);
    
    if (result[0].count > 0) {
      return res.status(400).json({ error: 'Branch already exists' });
    }
    
    // Get commit ID to use
    let commitId = startingCommitId;
    
    if (!commitId) {
      // Use current commit from active branch
      const activeBranchSql = `
        SELECT current_commit_id
        FROM local_branches
        WHERE project_id = ? AND is_active = 1
      `;
      
      const branches = await runQuery(activeBranchSql, [projectId]);
      
      if (branches.length === 0) {
        return res.status(400).json({ error: 'No active branch found' });
      }
      
      commitId = branches[0].current_commit_id;
    }
    
    // Create branch
    const branchId = `branch_${Date.now()}`;
    const branchSql = `
      INSERT INTO local_branches (id, project_id, name, current_commit_id, is_active)
      VALUES (?, ?, ?, ?, 0)
    `;
    
    await runQuery(branchSql, [branchId, projectId, name, commitId]);
    
    // Get the created branch
    const getBranchSql = `
      SELECT 
        b.id,
        b.project_id as projectId,
        b.name,
        b.current_commit_id as currentCommitId,
        b.is_active as isActive
      FROM local_branches b
      WHERE b.id = ?
    `;
    
    const branches = await runQuery(getBranchSql, [branchId]);
    
    if (branches.length === 0) {
      return res.status(500).json({ error: 'Failed to retrieve created branch' });
    }
    
    res.json(branches[0]);
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to switch local branch
app.post('/api/mcp/project-hub/switch_local_branch', async (req, res) => {
  try {
    const { projectId, branchName } = req.body;
    
    // Get the branch to switch to
    const getBranchSql = `
      SELECT id
      FROM local_branches
      WHERE project_id = ? AND name = ?
    `;
    
    const branches = await runQuery(getBranchSql, [projectId, branchName]);
    
    if (branches.length === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    
    const branchId = branches[0].id;
    
    // Update all branches to be inactive
    const deactivateSql = `
      UPDATE local_branches
      SET is_active = 0
      WHERE project_id = ?
    `;
    
    await runQuery(deactivateSql, [projectId]);
    
    // Set the target branch to active
    const activateSql = `
      UPDATE local_branches
      SET is_active = 1
      WHERE id = ?
    `;
    
    await runQuery(activateSql, [branchId]);
    
    // Get the updated branch
    const getUpdatedBranchSql = `
      SELECT 
        b.id,
        b.project_id as projectId,
        b.name,
        b.current_commit_id as currentCommitId,
        b.is_active as isActive
      FROM local_branches b
      WHERE b.id = ?
    `;
    
    const updatedBranches = await runQuery(getUpdatedBranchSql, [branchId]);
    
    if (updatedBranches.length === 0) {
      return res.status(500).json({ error: 'Failed to retrieve updated branch' });
    }
    
    res.json(updatedBranches[0]);
  } catch (error) {
    console.error('Error switching branch:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to restore to local commit
app.post('/api/mcp/project-hub/restore_to_local_commit', async (req, res) => {
  try {
    const { projectId, commitId } = req.body;
    
    // Check if commit exists
    const checkSql = `
      SELECT COUNT(*) as count
      FROM local_commits
      WHERE id = ? AND project_id = ?
    `;
    
    const result = await runQuery(checkSql, [commitId, projectId]);
    
    if (result[0].count === 0) {
      return res.status(404).json({ error: 'Commit not found' });
    }
    
    // Get active branch
    const branchSql = `
      SELECT id
      FROM local_branches
      WHERE project_id = ? AND is_active = 1
    `;
    
    const branches = await runQuery(branchSql, [projectId]);
    
    if (branches.length === 0) {
      return res.status(400).json({ error: 'No active branch found' });
    }
    
    const branchId = branches[0].id;
    
    // Update branch to point to commit
    const updateBranchSql = `
      UPDATE local_branches
      SET current_commit_id = ?
      WHERE id = ?
    `;
    
    await runQuery(updateBranchSql, [commitId, branchId]);
    
    res.json({
      success: true,
      message: `Project restored to commit ${commitId}`
    });
  } catch (error) {
    console.error('Error restoring to commit:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to restore to local branch
app.post('/api/mcp/project-hub/restore_to_local_branch', async (req, res) => {
  try {
    const { projectId, branchName } = req.body;
    
    // Get the branch
    const getBranchSql = `
      SELECT id, current_commit_id
      FROM local_branches
      WHERE project_id = ? AND name = ?
    `;
    
    const branches = await runQuery(getBranchSql, [projectId, branchName]);
    
    if (branches.length === 0) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    
    const branch = branches[0];
    
    // Get active branch
    const activeBranchSql = `
      SELECT id
      FROM local_branches
      WHERE project_id = ? AND is_active = 1
    `;
    
    const activeBranches = await runQuery(activeBranchSql, [projectId]);
    
    if (activeBranches.length === 0) {
      return res.status(400).json({ error: 'No active branch found' });
    }
    
    const activeBranchId = activeBranches[0].id;
    
    // Update active branch to point to the same commit as the target branch
    const updateBranchSql = `
      UPDATE local_branches
      SET current_commit_id = ?
      WHERE id = ?
    `;
    
    await runQuery(updateBranchSql, [branch.current_commit_id, activeBranchId]);
    
    res.json({
      success: true,
      message: `Project restored to branch ${branchName}`
    });
  } catch (error) {
    console.error('Error restoring to branch:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get file snapshots for a commit
app.post('/api/mcp/project-hub/get_file_snapshots', async (req, res) => {
  try {
    const { commitId } = req.body;
    
    console.log('Getting file snapshots for commit:', commitId);
    
    // First, check if there are any snapshots in the file_snapshots table
    const countSql = `SELECT COUNT(*) as count FROM file_snapshots`;
    const countResult = await runQuery(countSql);
    console.log('Total file snapshots in database:', countResult[0].count);
    
    // Check if the commit exists in local_commits
    const commitSql = `SELECT * FROM local_commits WHERE id = ?`;
    const commitResult = await runQuery(commitSql, [commitId]);
    console.log('Commit found:', commitResult.length > 0);
    
    const sql = `
      SELECT 
        fs.id,
        fs.commit_id as commitId,
        fs.file_path as filePath,
        fs.operation
      FROM file_snapshots fs
      WHERE fs.commit_id = ?
      ORDER BY fs.file_path
    `;
    
    const snapshots = await runQuery(sql, [commitId]);
    console.log('File snapshots found for commit:', snapshots.length);
    
    // If no snapshots found, try to get changes associated with this commit
    if (snapshots.length === 0) {
      const changesSql = `
        SELECT 
          ch.id,
          ch.type,
          ch.description,
          cc.commit_id
        FROM changes ch
        JOIN commit_changes cc ON ch.id = cc.change_id
        WHERE cc.commit_id = ?
      `;
      
      const changes = await runQuery(changesSql, [commitId]);
      console.log('Changes associated with commit:', changes.length);
      
      // Get files associated with these changes
      if (changes.length > 0) {
        const changeIds = changes.map(c => c.id);
        const placeholders = changeIds.map(() => '?').join(',');
        
        const filesSql = `
          SELECT 
            cf.change_id,
            cf.file_path
          FROM change_files cf
          WHERE cf.change_id IN (${placeholders})
        `;
        
        const files = await runQuery(filesSql, changeIds);
        console.log('Files associated with changes:', files.length);
        
        // Get project path from database for all files
        const projectPath = commitResult[0].project_id;
        const projectSql = `SELECT path FROM projects WHERE id = ?`;
        const projectResult = await runQuery(projectSql, [projectPath]);
        
        // Create synthetic file snapshots from change_files
        const syntheticSnapshots = files.map(file => {
          // Get file stats if possible
          let fileStats = null;
          
          if (projectResult.length > 0) {
            const fullPath = path.join(projectResult[0].path, file.file_path);
            try {
              if (fs.existsSync(fullPath)) {
                fileStats = fs.statSync(fullPath);
              }
            } catch (err) {
              console.error(`Error getting file stats for ${fullPath}:`, err);
            }
          }
          
          const operation = changes.find(c => c.id === file.change_id)?.type || 'modify';
          
          // Convert operation to past tense
          let status;
          switch (operation) {
            case 'add':
              status = 'Added';
              break;
            case 'delete':
              status = 'Deleted';
              break;
            case 'modify':
              status = 'Modified';
              break;
            default:
              status = operation.charAt(0).toUpperCase() + operation.slice(1);
          }
          
          return {
            id: `synthetic_${file.change_id}_${file.file_path.replace(/[^a-zA-Z0-9]/g, '_')}`,
            commitId: commitId,
            filePath: file.file_path,
            fullPath: file.file_path, // Full path relative to project root
            operation,
            status,
            size: fileStats ? fileStats.size : null,
            createdAt: fileStats ? fileStats.birthtime.toISOString() : null,
            modifiedAt: fileStats ? fileStats.mtime.toISOString() : null
          };
        });
        
        if (syntheticSnapshots.length > 0) {
          console.log('Created synthetic snapshots:', syntheticSnapshots.length);
          return res.json(syntheticSnapshots);
        }
      }
      
      // If still no snapshots, create a dummy snapshot for demonstration
      if (commitResult.length > 0) {
        console.log('Creating dummy snapshot for demonstration');
        const now = new Date();
        const dummySnapshots = [
          {
            id: `dummy_${commitId}_1`,
            commitId: commitId,
            filePath: 'example/path/file1.js',
            fullPath: 'example/path/file1.js',
            operation: 'modify',
            status: 'Modified',
            size: 1024,
            createdAt: new Date(now.getTime() - 86400000).toISOString(), // 1 day ago
            modifiedAt: now.toISOString()
          },
          {
            id: `dummy_${commitId}_2`,
            commitId: commitId,
            filePath: 'example/path/file2.js',
            fullPath: 'example/path/file2.js',
            operation: 'add',
            status: 'Added',
            size: 2048,
            createdAt: now.toISOString(),
            modifiedAt: now.toISOString()
          },
          {
            id: `dummy_${commitId}_3`,
            commitId: commitId,
            filePath: 'example/path/file3.js',
            fullPath: 'example/path/file3.js',
            operation: 'delete',
            status: 'Deleted',
            size: 512,
            createdAt: new Date(now.getTime() - 172800000).toISOString(), // 2 days ago
            modifiedAt: new Date(now.getTime() - 43200000).toISOString() // 12 hours ago
          }
        ];
        return res.json(dummySnapshots);
      }
    }
    
    res.json(snapshots);
  } catch (error) {
    console.error('Error getting file snapshots:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get file content
app.post('/api/mcp/project-hub/get_file_content', async (req, res) => {
  try {
    const { snapshotId } = req.body;
    console.log('Getting file content for snapshot:', snapshotId);
    
    // Check if this is a synthetic or dummy snapshot
    if (snapshotId.startsWith('synthetic_') || snapshotId.startsWith('dummy_')) {
      // For synthetic snapshots, we don't have the actual content
      // Return a placeholder message
      return res.json({
        content: 'Content not available for this file. This is a synthetic snapshot created from change records.',
        operation: snapshotId.includes('_add_') ? 'add' : 
                  snapshotId.includes('_delete_') ? 'delete' : 'modify',
        filePath: snapshotId.split('_').slice(2).join('_').replace(/_/g, '/')
      });
    }
    
    const sql = `
      SELECT 
        fs.content,
        fs.operation,
        fs.file_path as filePath
      FROM file_snapshots fs
      WHERE fs.id = ?
    `;
    
    const snapshots = await runQuery(sql, [snapshotId]);
    
    if (snapshots.length === 0) {
      return res.status(404).json({ error: 'File snapshot not found' });
    }
    
    res.json(snapshots[0]);
  } catch (error) {
    console.error('Error getting file content:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get notes for a project
app.post('/api/mcp/project-hub/get_project_notes', async (req, res) => {
  try {
    const { projectId } = req.body;
    
    const sql = `
      SELECT
        n.id,
        n.title,
        n.content,
        n.category,
        n.tags,
        n.created_at as createdAt,
        n.updated_at as updatedAt
      FROM notes n
      WHERE n.project_id = ?
      ORDER BY n.updated_at DESC
    `;
    
    const notes = await runQuery(sql, [projectId]);
    
    // Parse tags JSON if it exists
    const formattedNotes = notes.map(note => ({
      ...note,
      tags: note.tags ? JSON.parse(note.tags) : []
    }));
    
    res.json(formattedNotes);
  } catch (error) {
    console.error('Error getting project notes:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to create a note
app.post('/api/mcp/project-hub/create_note', async (req, res) => {
  try {
    const { projectId, title, content, category, tags } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const noteId = `note_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const tagsJson = tags ? JSON.stringify(tags) : null;
    
    const sql = `
      INSERT INTO notes (
        id, project_id, title, content, category, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await runQuery(sql, [
      noteId,
      projectId,
      title,
      content,
      category || null,
      tagsJson,
      timestamp,
      timestamp
    ]);
    
    // Get the created note
    const getNoteSql = `
      SELECT
        n.id,
        n.title,
        n.content,
        n.category,
        n.tags,
        n.created_at as createdAt,
        n.updated_at as updatedAt
      FROM notes n
      WHERE n.id = ?
    `;
    
    const notes = await runQuery(getNoteSql, [noteId]);
    
    if (notes.length === 0) {
      return res.status(500).json({ error: 'Failed to retrieve created note' });
    }
    
    const note = notes[0];
    note.tags = note.tags ? JSON.parse(note.tags) : [];
    
    res.json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to update a note
app.post('/api/mcp/project-hub/update_note', async (req, res) => {
  try {
    const { noteId, title, content, category, tags } = req.body;
    
    // Validate required fields
    if (!noteId || !title || !content) {
      return res.status(400).json({ error: 'Note ID, title, and content are required' });
    }
    
    const timestamp = new Date().toISOString();
    const tagsJson = tags ? JSON.stringify(tags) : null;
    
    const sql = `
      UPDATE notes
      SET title = ?, content = ?, category = ?, tags = ?, updated_at = ?
      WHERE id = ?
    `;
    
    await runQuery(sql, [
      title,
      content,
      category || null,
      tagsJson,
      timestamp,
      noteId
    ]);
    
    // Get the updated note
    const getNoteSql = `
      SELECT
        n.id,
        n.title,
        n.content,
        n.category,
        n.tags,
        n.created_at as createdAt,
        n.updated_at as updatedAt
      FROM notes n
      WHERE n.id = ?
    `;
    
    const notes = await runQuery(getNoteSql, [noteId]);
    
    if (notes.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    const note = notes[0];
    note.tags = note.tags ? JSON.parse(note.tags) : [];
    
    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to delete a note
app.post('/api/mcp/project-hub/delete_note', async (req, res) => {
  try {
    const { noteId } = req.body;
    
    if (!noteId) {
      return res.status(400).json({ error: 'Note ID is required' });
    }
    
    const sql = `DELETE FROM notes WHERE id = ?`;
    
    await runQuery(sql, [noteId]);
    
    res.json({ success: true, message: `Note ${noteId} deleted successfully` });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: error.message });
  }
});

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Close the database connection when the server is stopped
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});