$envContent = Get-Content .env
$anthropicKey = ($envContent | Where-Object { $_ -like "ANTHROPIC_API_KEY=*" }).Substring(19)
$replicateKey = ($envContent | Where-Object { $_ -like "REPLICATE_API_TOKEN=*" }).Substring(20)
npx supabase secrets set "ANTHROPIC_API_KEY=$anthropicKey"
npx supabase secrets set "REPLICATE_API_TOKEN=$replicateKey"
npx supabase secrets list
