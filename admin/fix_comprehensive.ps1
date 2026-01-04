$path = 'c:\Users\Aza\Desktop\IT\admin\admin.js'
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Fix truncated style tags (missing closing quote and >)
$content = $content -replace '<div class="admin-modal" style="max-width: 700px;([^>]*?)(?=<div)', '<div class="admin-modal" style="max-width: 700px;">$1'

# Fix truncated data-id tags
$content = $content -replace '<div class="schedule-item" data-id="\$\{l.id\}([^>]*?)(?=<div)', '<div class="schedule-item" data-id="${l.id}">$1'

# Fix truncated modal tags (missing >)
$content = $content -replace '<div class="admin-modal"([^>]*?)(?=<div class="admin-modal-header)', '<div class="admin-modal">$1'

# Fix log table row tr tag
$content = $content -replace "< tr data-log-action='\s*\+\s*log\.action\s*\+\s*'", "<tr data-log-action=`"' + log.action + '`">"

[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Comprehensive fixes applied to admin.js"
