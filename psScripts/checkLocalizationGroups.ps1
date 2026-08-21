param(
    [String]$SqlName         = "",
    [String]$SqlPassword     = "",
    [String]$SqlDatabaseName = "",
    [String]$CheckoutPath    = ""
)

$PS_firstLevelLog  = "   "
$PS_secondLevelLog = "      "

Write-Host "!Check the correctness"
Write-Host $PS_firstLevelLog "SqlName          -->" $SqlName
Write-Host $PS_firstLevelLog "SqlDatabaseName  -->" $SqlDatabaseName
Write-Host $PS_firstLevelLog "CheckoutPath     -->" $CheckoutPath
Write-Host "!End of params"

Write-Host "!Checking params"
if ([string]::IsNullOrEmpty($SqlName))         { Write-Host $PS_firstLevelLog "SqlName param is empty";         exit 1 }
if ([string]::IsNullOrEmpty($SqlPassword))     { Write-Host $PS_firstLevelLog "SqlPassword param is empty";     exit 1 }
if ([string]::IsNullOrEmpty($SqlDatabaseName)) { Write-Host $PS_firstLevelLog "SqlDatabaseName param is empty"; exit 1 }
if ([string]::IsNullOrEmpty($CheckoutPath))    { Write-Host $PS_firstLevelLog "CheckoutPath param is empty";    exit 1 }
Write-Host "!Params checked"

function Invoke-SqlQuery
{
    param([string]$Query)

    $connectionString = "Server=$SqlName;Database=$SqlDatabaseName;User Id=sa;Password=$SqlPassword;"
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()

    $command = New-Object System.Data.SqlClient.SqlCommand($Query, $connection)
    $reader = $command.ExecuteReader()

    $results = New-Object System.Collections.Generic.List[string]
    while ($reader.Read())
    {
        $results.Add($reader.GetString(0))
    }

    $reader.Close()
    $connection.Close()
    return , $results.ToArray()
}

function Get-GroupFromDictionary
{
    param([string]$ResourceKey, [hashtable]$Groups)

    foreach ($entry in $Groups.GetEnumerator() | Sort-Object { $_.Key.Length } -Descending)
    {
        foreach ($prefix in $entry.Value)
        {
            if ($ResourceKey -eq $prefix -or
                $ResourceKey.StartsWith($prefix + ".", [System.StringComparison]::OrdinalIgnoreCase))
            {
                return $entry.Key
            }
        }
    }

    return $null
}

function Get-ModuleGroup
{
    param([string]$ResourceKey, [string[]]$ModuleIds)

    $matched = $ModuleIds | Where-Object {
        $ResourceKey.StartsWith($_ + ".", [System.StringComparison]::OrdinalIgnoreCase) -or
        $ResourceKey.StartsWith("Admin." + $_ + ".", [System.StringComparison]::OrdinalIgnoreCase)
    } | Select-Object -First 1

    if (-not $matched) { return $null }

    if ($ResourceKey.StartsWith("Admin.", [System.StringComparison]::OrdinalIgnoreCase))
    {
        return "Admin." + $matched
    }
    return $matched
}

function Get-FallbackGroup
{
    param([string]$ResourceKey)

    $dotIndex = $ResourceKey.IndexOf('.')
    if ($dotIndex -le 0) { return $ResourceKey }

    $firstSegment = $ResourceKey.Substring(0, $dotIndex)

    if ($firstSegment -eq "Admin")
    {
        $secondDot = $ResourceKey.IndexOf('.', $dotIndex + 1)
        if ($secondDot -gt 0) { return $ResourceKey.Substring(0, $secondDot) }
        return $firstSegment
    }

    return $firstSegment
}

try
{
    Write-Host $PS_firstLevelLog "Loading Web.LocalizationGroups.config"
    $configPath = Join-Path $CheckoutPath "AdvantShop.Web\Web.LocalizationGroups.config"
    if (-not (Test-Path $configPath))
    {
        Write-Host $PS_firstLevelLog "Config file not found: $configPath"
        exit 1
    }

    [xml]$config = Get-Content $configPath -Encoding UTF8
    $groups = @{}
    foreach ($group in $config.LocalizationGroups.Group)
    {
        $groups[$group.name] = @($group.Prefix)
    }
    Write-Host $PS_secondLevelLog "Loaded $($groups.Count) groups"

    Write-Host $PS_firstLevelLog "Loading localization keys from DB"
    $keys = Invoke-SqlQuery "SELECT DISTINCT ResourceKey FROM [Settings].[Localization]"
    Write-Host $PS_secondLevelLog "Found $($keys.Count) keys"

    Write-Host $PS_firstLevelLog "Loading modules from DB"
    $moduleIds = Invoke-SqlQuery "SELECT ModuleStringID FROM [dbo].[Modules]"
    Write-Host $PS_secondLevelLog "Found $($moduleIds.Count) modules"

    $excludedFromCache = @("Js", "Admin.Js")

    Write-Host $PS_firstLevelLog "Checking keys..."
    $errors = @()

    foreach ($key in $keys)
    {
        $group = Get-GroupFromDictionary $key $groups
        if ($group) { continue }

        $isExcluded = $excludedFromCache | Where-Object {
            $key.StartsWith($_ + ".", [System.StringComparison]::OrdinalIgnoreCase)
        }
        if ($isExcluded) { continue }

        $moduleGroup = Get-ModuleGroup $key $moduleIds
        if ($moduleGroup) { continue }

        $errors += $key
    }

    if ($errors.Count -eq 0)
    {
        Write-Host $PS_firstLevelLog "All $($keys.Count) keys have known groups"
    }
    else
    {
        Write-Host $PS_firstLevelLog "Found $($errors.Count) key(s) without a known group:"
        foreach ($err in $errors)
        {
            Write-Host $PS_secondLevelLog $err
        }
        exit 1
    }
}
catch [Exception]
{
    Write-Host $PS_firstLevelLog "Error: $_"
    exit 1
}

Write-Host "!Done!"