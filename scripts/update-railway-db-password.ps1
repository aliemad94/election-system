[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$serviceName = "election-system"
$requiredVariables = @("DATABASE_URL", "DIRECT_DATABASE_URL")

function Set-PasswordInConnectionString {
  param(
    [Parameter(Mandatory = $true)][string]$ConnectionString,
    [Parameter(Mandatory = $true)][string]$Password
  )

  $uri = [Uri]$ConnectionString
  if ($uri.Scheme -notin @("postgres", "postgresql")) {
    throw "Expected a PostgreSQL connection string."
  }
  if (-not $uri.UserInfo.Contains(":")) {
    throw "The existing connection string has no password segment."
  }

  $encodedPassword = [Uri]::EscapeDataString($Password)
  $encodedUsername = $uri.UserInfo.Split(":", 2)[0]
  $authority = "{0}:{1}" -f $uri.Host, $uri.Port
  return "{0}://{1}:{2}@{3}{4}{5}" -f `
    $uri.Scheme, $encodedUsername, $encodedPassword, $authority, `
    $uri.AbsolutePath, $uri.Query
}

try {
  $variablesJson = & railway variable list --service $serviceName --json
  if ($LASTEXITCODE -ne 0) {
    throw "Unable to read Railway variables. Ensure the Railway CLI is logged in."
  }
  $variables = $variablesJson | ConvertFrom-Json
  foreach ($name in $requiredVariables) {
    if (-not $variables.PSObject.Properties[$name] -or -not $variables.$name) {
      throw "Railway variable $name is missing."
    }
  }

  $securePassword = Read-Host "Paste the NEW Supabase database password (it will stay hidden)" -AsSecureString
  $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
  try {
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    if ([string]::IsNullOrWhiteSpace($plainPassword)) {
      throw "No password was provided."
    }

    $appConnection = Set-PasswordInConnectionString $variables.DATABASE_URL $plainPassword
    $directConnection = Set-PasswordInConnectionString $variables.DIRECT_DATABASE_URL $plainPassword

    & railway variable set --service $serviceName --skip-deploys `
      "DATABASE_URL=[REDACTED]" `
      "DIRECT_DATABASE_URL=[REDACTED]" | Out-Null
    if ($LASTEXITCODE -ne 0) {
      throw "Railway rejected the variable update."
    }
  }
  finally {
    if ($passwordPointer -ne [IntPtr]::Zero) {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
    Remove-Variable plainPassword, appConnection, directConnection -ErrorAction SilentlyContinue
  }

  Write-Host "SUCCESS: Railway database URLs were updated without deploying the service."
  Write-Host "Return to Codex and reply: تم تحديث Railway"
}
catch {
  Write-Error $_.Exception.Message
  exit 1
}
