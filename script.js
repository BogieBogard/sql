function convertSQL() {
  const input = document.getElementById('sqlInput').value.trim();
  const lower = input.toLowerCase();
  const previewEl = document.getElementById('preview');
  const statusIndicator = document.getElementById('statusIndicator');
  const convertButton = document.querySelector('.convert-button');
  const buttonIcon = convertButton.querySelector('i');

  // Add loading state
  convertButton.classList.add('loading');
  buttonIcon.className = 'fas fa-spinner';

  // Simulate processing delay for better UX
  setTimeout(() => {
    let result = '';
    let status = 'success';

    try {
      if (lower.startsWith('update')) {
        // Remove extra whitespace and normalize
        const normalized = input.replace(/\s+/g, ' ').trim();
        
        // More robust UPDATE pattern that handles table aliases
        const updatePattern = /UPDATE\s+(\w+(?:\.\w+)?(?:\s+\w+)?)\s+SET\s+(.+?)\s+WHERE\s+(.+?)(?:;|$)/is;
        const match = normalized.match(updatePattern);
        
        if (match) {
          // Extract table name (remove alias if present)
          const tableWithAlias = match[1].trim();
          const table = tableWithAlias.split(/\s+/)[0]; // Take only the first word (table name)
          const where = match[3].replace(/;+$/, '').trim(); // Remove any trailing semicolons
          result = `SELECT * FROM ${table} WHERE ${where};`;
        } else {
          result = '❌ Could not parse UPDATE query. Please ensure it includes a WHERE clause.';
          status = 'error';
        }
      } else if (lower.startsWith('delete')) {
        // Remove extra whitespace and normalize
        const normalized = input.replace(/\s+/g, ' ').trim();
        
        // More robust DELETE pattern that handles table aliases
        const deletePattern = /DELETE\s+FROM\s+(\w+(?:\.\w+)?(?:\s+\w+)?)\s+WHERE\s+(.+?)(?:;|$)/is;
        const match = normalized.match(deletePattern);
        
        if (match) {
          // Extract table name (remove alias if present)
          const tableWithAlias = match[1].trim();
          const table = tableWithAlias.split(/\s+/)[0]; // Take only the first word (table name)
          const where = match[2].replace(/;+$/, '').trim(); // Remove any trailing semicolons
          result = `SELECT * FROM ${table} WHERE ${where};`;
        } else {
          result = '❌ Could not parse DELETE query. Please ensure it includes a WHERE clause.';
          status = 'error';
        }
      } else if (input === '') {
        result = 'Your converted SELECT query will appear here...';
        status = 'empty';
      } else {
        result = '⚠️ Only UPDATE and DELETE statements are supported.\n\nSupported formats:\n• UPDATE table SET column = value WHERE condition;\n• DELETE FROM table WHERE condition;';
        status = 'warning';
      }
    } catch (e) {
      console.error(e);
      result = '❌ Error parsing SQL query. Please check your syntax.';
      status = 'error';
    }

    // Update the preview with animation
    previewEl.style.opacity = '0';
    setTimeout(() => {
      previewEl.textContent = result;
      previewEl.className = `output-content ${status === 'empty' ? 'empty' : ''}`;
      previewEl.style.opacity = '1';
    }, 150);
    
    // Update status indicator
    statusIndicator.className = `status-indicator ${status === 'empty' ? '' : status}`;
    
    // Add success animation
    if (status === 'success') {
      previewEl.parentElement.classList.add('success-animation');
      setTimeout(() => {
        previewEl.parentElement.classList.remove('success-animation');
      }, 300);
    }

    // Remove loading state
    convertButton.classList.remove('loading');
    buttonIcon.className = 'fas fa-bolt';
  }, 300);
}

function copyToClipboard() {
  const previewEl = document.getElementById('preview');
  const text = previewEl.textContent;
  
  if (text && !text.includes('Your converted SELECT query will appear here') && !text.includes('❌') && !text.includes('⚠️')) {
    navigator.clipboard.writeText(text).then(() => {
      const copyButton = document.querySelector('.copy-button');
      const originalHTML = copyButton.innerHTML;
      
      copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
      copyButton.classList.add('copied');
      
      setTimeout(() => {
        copyButton.innerHTML = originalHTML;
        copyButton.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      const copyButton = document.querySelector('.copy-button');
      const originalHTML = copyButton.innerHTML;
      
      copyButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed';
      copyButton.style.background = 'rgba(239, 68, 68, 0.2)';
      copyButton.style.borderColor = 'rgba(239, 68, 68, 0.4)';
      
      setTimeout(() => {
        copyButton.innerHTML = originalHTML;
        copyButton.style.background = '';
        copyButton.style.borderColor = '';
      }, 2000);
    });
  }
}

function loadExample(element) {
  const codeElement = element.querySelector('.example-code');
  const exampleQuery = codeElement.textContent;
  document.getElementById('sqlInput').value = exampleQuery;
  convertSQL();
  
  // Scroll to output
  document.querySelector('.output-section').scrollIntoView({ 
    behavior: 'smooth',
    block: 'center'
  });
}

// Auto-convert on input change with debounce
let debounceTimer;
document.getElementById('sqlInput').addEventListener('input', function() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(convertSQL, 500);
});

// Add keyboard shortcut (Ctrl/Cmd + Enter to convert)
document.getElementById('sqlInput').addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    convertSQL();
  }
}); 