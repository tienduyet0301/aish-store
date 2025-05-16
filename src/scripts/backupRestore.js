import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

// Cấu hình
const DB_NAME = 'aishh';
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

// Tạo thư mục backup nếu chưa tồn tại
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Backup database
const backupDatabase = async () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);

  try {
    console.log('Starting database backup...');
    
    // Tạo thư mục backup với timestamp
    fs.mkdirSync(backupPath, { recursive: true });

    // Backup toàn bộ database
    const { stdout, stderr } = await execAsync(
      `mongodump --uri="${MONGODB_URI}" --db=${DB_NAME} --out="${backupPath}"`
    );

    if (stderr) {
      console.error('Backup error:', stderr);
      return false;
    }

    console.log('Backup completed successfully!');
    console.log(`Backup location: ${backupPath}`);
    return true;
  } catch (error) {
    console.error('Backup failed:', error);
    return false;
  }
};

// Restore database
const restoreDatabase = async (backupPath) => {
  try {
    console.log('Starting database restore...');

    // Kiểm tra thư mục backup có tồn tại
    if (!fs.existsSync(backupPath)) {
      console.error('Backup directory not found:', backupPath);
      return false;
    }

    // Restore database
    const { stdout, stderr } = await execAsync(
      `mongorestore --uri="${MONGODB_URI}" --db=${DB_NAME} "${backupPath}/${DB_NAME}"`
    );

    if (stderr) {
      console.error('Restore error:', stderr);
      return false;
    }

    console.log('Restore completed successfully!');
    return true;
  } catch (error) {
    console.error('Restore failed:', error);
    return false;
  }
};

// Liệt kê các backup có sẵn
const listBackups = () => {
  try {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-'))
      .sort()
      .reverse();

    if (backups.length === 0) {
      console.log('No backups found.');
      return [];
    }

    console.log('Available backups:');
    backups.forEach((backup, index) => {
      const stats = fs.statSync(path.join(BACKUP_DIR, backup));
      console.log(`${index + 1}. ${backup} (${new Date(stats.mtime).toLocaleString()})`);
    });

    return backups;
  } catch (error) {
    console.error('Error listing backups:', error);
    return [];
  }
};

// Xóa backup cũ
const cleanupOldBackups = async (keepLast = 5) => {
  try {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-'))
      .sort()
      .reverse();

    if (backups.length <= keepLast) {
      return;
    }

    console.log(`Cleaning up old backups, keeping last ${keepLast}...`);
    
    for (let i = keepLast; i < backups.length; i++) {
      const backupPath = path.join(BACKUP_DIR, backups[i]);
      fs.rmSync(backupPath, { recursive: true, force: true });
      console.log(`Deleted old backup: ${backups[i]}`);
    }
  } catch (error) {
    console.error('Error cleaning up old backups:', error);
  }
};

// Xử lý command line arguments
const main = async () => {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'backup':
      await backupDatabase();
      await cleanupOldBackups();
      break;

    case 'restore':
      if (!arg) {
        console.log('Please specify a backup to restore.');
        console.log('Usage: node backupRestore.js restore <backup-name>');
        return;
      }
      const backupPath = path.join(BACKUP_DIR, arg);
      await restoreDatabase(backupPath);
      break;

    case 'list':
      listBackups();
      break;

    default:
      console.log('Usage:');
      console.log('  node backupRestore.js backup');
      console.log('  node backupRestore.js restore <backup-name>');
      console.log('  node backupRestore.js list');
  }
};

main(); 