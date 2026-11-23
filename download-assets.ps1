# AdoraDrive — baixa todos os 33 assets do CDN Lovable
# Roda no PowerShell dentro da pasta do projeto:
# cd C:\Users\victo\Downloads\adoradrive-railway-ready\gospel-road-glow-main
# .\download-assets.ps1

$base = "https://gptengineer.app/__l5e/assets-v1"
$outDir = "src\assets\media"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$assets = @(
    "ceaf9203-17c7-4eac-b1ca-113bc8c86c19/anjos-guardioes.mp4",
    "60183e26-755c-47a9-836c-7f6406659a6a/anjos-loop-suave.mp4",
    "a2e3b97f-1ad9-4609-a416-a192e2b470d8/anjos-nuvens-continuo.mp4",
    "b822eb60-de92-4087-8b8f-1a9bf82f52c8/anjos-nuvens.jpg",
    "7c68f57e-d79c-42cf-a600-cb15d6274bd2/anjos-nuvens.mp4",
    "6b92d1a2-f2ab-452a-bbb3-4f63833935c9/anjos-original.jpg",
    "da583cba-bd1c-4e06-8430-d8e9db3bffa9/bencao-1.mp3",
    "8570a397-428a-43e4-9921-de819face891/bencao-2.mp3",
    "03dcf0da-ca29-486a-990d-c8caeaa04991/bencao-3.mp3",
    "bfd02f45-a6e1-40e0-b0a8-c92741e39dc4/boas-vindas.mp3",
    "96d58dd7-7634-4866-b6b6-ff5f24cb8fe3/ceu-anjos-classicos.png",
    "5e208234-c2ec-49f8-a236-29dcb2185e25/ceu-anjos-nuvens.png",
    "68ba4cda-418c-4cd9-8fdf-0ee98bd6cfd1/ceu-anjos.png",
    "0d76e173-5ed0-4435-9492-772495af3814/ceu-classico-anjo.png",
    "cf472263-4630-4779-b414-24edfc679eae/ceu-classico-cruz.png",
    "f8f72e9a-03f1-41a5-aac3-f658fcc24677/ceu-classico-jesus.png",
    "0837d5d8-34ff-41f7-b6c7-3281784d98b9/ceu-classico-pomba.png",
    "acc82a44-f2ef-4760-ba74-9c50e5337c3f/ceu-jesus.png",
    "83f8d03c-54e4-4aec-8f6f-e96cec26c45a/ceu-maos.png",
    "a7eb48e8-ae27-45c5-95c3-96e18417ebd9/ceu-nuvens.png",
    "4c3d82e9-2ec5-4fbe-a916-c2a2d3ad086c/design-anjos.jpg",
    "e6f7993f-f83e-482d-91eb-8f927ec41137/design-jesus.jpg",
    "08e27d5b-f137-4c3b-b897-217e76c69f85/design-maos.jpg",
    "8aa4f9d2-743c-4a10-9076-02bb41a7a6f8/design-pomba.jpg",
    "5b0d8607-7856-4d61-815a-fd67430f9313/fundo-anjo.jpg",
    "729410b1-fa56-4dca-851a-4f7e5b953681/fundo-cruz.jpg",
    "ec8fc35f-2c23-4214-86fa-3b5d7cc767f5/fundo-jesus.jpg",
    "8b23d48a-3d97-491e-9934-703c4367877a/fundo-pomba.jpg",
    "1b5c213c-24e3-4c79-8f4f-a99d8e6fafbb/maos-loop-suave.mp4",
    "fab479b8-8efc-4772-8417-e299458a8370/scan-anjos.jpg",
    "d94ef35d-d605-485a-be7f-675f465843da/scanner-monte.png",
    "f57bfdc1-c71c-43db-9af0-4a9502cc8472/versiculo-1.mp3",
    "e4fee37b-21a8-427c-a3c4-d16d31fa5a04/versiculo-2.mp3"
)

$headers = @{
    "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    "Referer"    = "https://gptengineer.app"
    "Origin"     = "https://gptengineer.app"
}

$ok = 0; $fail = 0
foreach ($asset in $assets) {
    $filename = $asset.Split("/")[-1]
    $dest = "$outDir\$filename"
    if (Test-Path $dest) { Write-Host "skip $filename"; $ok++; continue }
    $url = "$base/$asset"
    Write-Host "baixando $filename..." -NoNewline
    try {
        Invoke-WebRequest -Uri $url -Headers $headers -OutFile $dest -UseBasicParsing
        $size = [math]::Round((Get-Item $dest).Length / 1KB)
        Write-Host " OK (${size}KB)"
        $ok++
    } catch {
        Write-Host " FALHOU: $_"
        $fail++
    }
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "Concluido: $ok OK, $fail falhas"
Write-Host "Pasta: $(Resolve-Path $outDir)"
