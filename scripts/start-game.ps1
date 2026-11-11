$ErrorActionPreference = 'Stop'
$gameRoot = Split-Path -Parent $PSScriptRoot
$gameUrl = 'http://127.0.0.1:4178'
$running = $false
try {
    $response = Invoke-WebRequest -Uri ($gameUrl + '/health') -UseBasicParsing -TimeoutSec 2
    $running = $response.Content -eq 'no-outside-daedalos-v2'
} catch {}
if (-not $running) {
    $nodeCommand = Get-Command node -ErrorAction Stop
    Start-Process -FilePath $nodeCommand.Source -ArgumentList 'server.mjs' -WorkingDirectory $gameRoot -WindowStyle Hidden
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Milliseconds 150
        try {
            $response = Invoke-WebRequest -Uri ($gameUrl + '/health') -UseBasicParsing -TimeoutSec 1
            if ($response.Content -eq 'no-outside-daedalos-v2') { $running = $true; break }
        } catch {}
    }
}
if (-not $running) { throw '游戏服务没有启动。请检查本机4178端口或运行 npm start。' }
Start-Process $gameUrl
