const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Temporary directory for compilation
const TEMP_DIR = path.join(__dirname, '../temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Clean up old temp files (older than 1 hour)
const cleanupTempFiles = () => {
  try {
    const files = fs.readdirSync(TEMP_DIR);
    const now = Date.now();
    
    files.forEach(file => {
      const filePath = path.join(TEMP_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > 60 * 60 * 1000) { // 1 hour
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
};

// Run cleanup every 30 minutes
setInterval(cleanupTempFiles, 30 * 60 * 1000);

// Compile and run C code
router.post('/compile', async (req, res) => {
  try {
    const { code, input = '', timeout = 5000 } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required.' });
    }

    const fileId = uuidv4();
    const cFilePath = path.join(TEMP_DIR, `${fileId}.c`);
    const executablePath = path.join(TEMP_DIR, fileId);
    
    // Write C code to file
    fs.writeFileSync(cFilePath, code);

    // Compile the code
    exec(`gcc "${cFilePath}" -o "${executablePath}"`, (compileError, stdout, stderr) => {
      if (compileError) {
        // Clean up files
        try {
          fs.unlinkSync(cFilePath);
        } catch (error) {}
        
        return res.status(400).json({
          success: false,
          error: 'Compilation failed',
          compilationError: stderr,
          stdout: stdout
        });
      }

      // Run the compiled code
      const child = exec(`"${executablePath}"`, { timeout: timeout }, (runError, stdout, stderr) => {
        // Clean up files
        try {
          fs.unlinkSync(cFilePath);
          fs.unlinkSync(executablePath);
        } catch (error) {}

        if (runError) {
          if (runError.killed) {
            return res.status(400).json({
              success: false,
              error: 'Execution timeout',
              timeout: true
            });
          }
          
          return res.status(400).json({
            success: false,
            error: 'Runtime error',
            runtimeError: stderr,
            stdout: stdout
          });
        }

        res.json({
          success: true,
          output: stdout,
          error: stderr,
          executionTime: Date.now()
        });
      });

      // Provide input to the program if needed
      if (input) {
        child.stdin.write(input);
        child.stdin.end();
      }
    });
  } catch (error) {
    console.error('Compiler error:', error);
    res.status(500).json({ error: 'Server error during compilation.' });
  }
});

// Validate C code syntax without running
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required.' });
    }

    const fileId = uuidv4();
    const cFilePath = path.join(TEMP_DIR, `${fileId}.c`);
    
    // Write C code to file
    fs.writeFileSync(cFilePath, code);

    // Check syntax using gcc -fsyntax-only
    exec(`gcc -fsyntax-only "${cFilePath}"`, (error, stdout, stderr) => {
      // Clean up file
      try {
        fs.unlinkSync(cFilePath);
      } catch (cleanupError) {}

      if (error) {
        return res.status(400).json({
          valid: false,
          syntaxErrors: stderr,
          warnings: stdout
        });
      }

      res.json({
        valid: true,
        message: 'Syntax is valid.',
        warnings: stdout
      });
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Server error during validation.' });
  }
});

// Format C code
router.post('/format', async (req, res) => {
  try {
    const { code, style = 'allman' } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required.' });
    }

    // Basic formatting rules (simplified)
    let formattedCode = code;

    // Basic formatting operations
    formattedCode = formattedCode
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/;\s*/g, ';\n') // Add newline after semicolons
      .replace(/\{\s*/g, ' {\n  ') // Format opening braces
      .replace(/\}\s*/g, '\n}\n') // Format closing braces
      .replace(/,\s*/g, ', ') // Format commas
      .replace(/\s*\(/g, '(') // Remove space before opening parenthesis
      .replace(/\)\s*/g, ') ') // Add space after closing parenthesis
      .replace(/\s*\n\s*\n\s*/g, '\n\n') // Remove excessive newlines
      .trim();

    res.json({
      formatted: formattedCode,
      original: code
    });
  } catch (error) {
    console.error('Formatting error:', error);
    res.status(500).json({ error: 'Server error during formatting.' });
  }
});

// Get compiler information
router.get('/info', (req, res) => {
  exec('gcc --version', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Unable to get compiler information.' });
    }

    res.json({
      compiler: 'GCC',
      version: stdout.split('\n')[0],
      supportedLanguages: ['c'],
      features: [
        'Compilation',
        'Execution',
        'Syntax validation',
        'Basic formatting'
      ]
    });
  });
});

module.exports = router;
