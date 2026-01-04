const fs = require('fs');
const filePath = 'C:/Users/Aza/Desktop/IT/admin/admin.js';

let content = fs.readFileSync(filePath, 'utf8');

// Fix settings tab selector
content = content.replace(/`settings-tab-\$\{ tab\.dataset\.tab \} `/g, '"settings-tab-" + tab.dataset.tab');

// Fix getElementById with template literal
content = content.replace(/getElementById\(`set-\$\{ key \} `\)/g, 'getElementById("set-" + key)');

// Fix log table rows - this is tricky as it spans multiple lines
const logRowPattern = /tbody\.innerHTML = filteredLogs\.map\(log => `\s*< tr data-log-action="\$\{log\.action\}\s*<td>\$\{actionIcons\[log\.action\] \|\| "📝"\}<\/td>\s*<td>\$\{formatLogTime\(log\.timestamp\)\}<\/td>\s*<td>\$\{log\.admin\}<\/td>\s*<td>\$\{actionLabels\[log\.action\] \|\| log\.action\}<\/td>\s*<td>\$\{log\.target \|\| "—"\}<\/td>\s*<td style="color: #9ca3af; font-size: 0\.85rem;">\$\{log\.details \|\| ""\}<\/td>\s*<\/tr>\s*`\)\.join\(""\);/gs;

const logRowReplacement = `tbody.innerHTML = filteredLogs.map(function(log) {
        return '<tr data-log-action="' + log.action + '">' +
          '<td>' + (actionIcons[log.action] || "📝") + '</td>' +
          '<td>' + formatLogTime(log.timestamp) + '</td>' +
          '<td>' + log.admin + '</td>' +
          '<td>' + (actionLabels[log.action] || log.action) + '</td>' +
          '<td>' + (log.target || "—") + '</td>' +
          '<td style="color: #9ca3af; font-size: 0.85rem;">' + (log.details || "") + '</td></tr>';
      }).join("");`;

content = content.replace(logRowPattern, logRowReplacement);

// Fix schedule group options
content = content.replace(/groups\.map\(g => `<option value = "\$\{g\.id\} \$\{ g\.id \}<\/option> `\)/g, 
  'groups.map(function(g) { return \'<option value="\' + g.id + \'">\' + g.id + \'</option>\'; })');

// Fix mentor options
content = content.replace(/mentors\.map\(m => `<option value = "\$\{m\.name\} \$\{ m\.name \}<\/option> `\)/g,
  'mentors.map(function(m) { return \'<option value="\' + m.name + \'">\' + m.name + \'</option>\'; })');

// Fix msg group options
content = content.replace(/`<option value = "\$\{g\.id\} \$\{ g\.id \} - \$\{ g\.courseName \|\| "" \}<\/option> `/g,
  '\'<option value="\' + g.id + \'">\' + g.id + \' - \' + (g.courseName || \'\') + \'</option>\'');

fs.writeFileSync(filePath, content);
console.log('Template literals fixed!');


