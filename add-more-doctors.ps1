# Add 100 More Doctors to MediCare

$firstNames = @("Aakash", "Aditya", "Akshay", "Amit", "Anand", "Anil", "Ankur", "Arjun", "Ashish", "Bharat", "Chetan", "Deepak", "Dhruv", "Gaurav", "Girish", "Hari", "Hemant", "Jagdish", "Karan", "Kunal", "Lalit", "Manish", "Mohit", "Mukesh", "Naveen", "Nikhil", "Pankaj", "Paresh", "Pranav", "Rahul", "Rajat", "Rakesh", "Ramesh", "Rohit", "Sachin", "Sameer", "Sanjay", "Santosh", "Shashank", "Shiv", "Sunil", "Tushar", "Umesh", "Varun", "Vijay", "Vikash", "Vinay", "Vishal", "Vivek", "Yash")
$femaleNames = @("Aarti", "Aditi", "Amita", "Ananya", "Anjali", "Archana", "Bhavna", "Chitra", "Deepika", "Divya", "Ekta", "Garima", "Gayatri", "Isha", "Jaya", "Jyoti", "Kavita", "Komal", "Lakshmi", "Madhuri", "Meena", "Megha", "Nandini", "Neeta", "Nidhi", "Pallavi", "Payal", "Pooja", "Preeti", "Priya", "Rachna", "Radha", "Rashmi", "Ritu", "Ruchi", "Sangita", "Sapna", "Seema", "Shilpa", "Shreya", "Shweta", "Sneha", "Sonal", "Sunita", "Swati", "Tanvi", "Tina", "Uma", "Vandana", "Varsha")
$lastNames = @("Agarwal", "Arora", "Bansal", "Bhatia", "Bhatt", "Chauhan", "Chawla", "Chopra", "Das", "Deshmukh", "Dubey", "Garg", "Goel", "Goyal", "Gupta", "Iyer", "Jain", "Joshi", "Kapoor", "Khanna", "Kumar", "Malhotra", "Mehta", "Mishra", "Mukherjee", "Nair", "Pandey", "Patel", "Pillai", "Prasad", "Rao", "Reddy", "Saxena", "Sethi", "Shah", "Sharma", "Shukla", "Singh", "Sinha", "Srivastava", "Tiwari", "Varma", "Verma", "Yadav")

$specs = @(
    @{name = "Cardiology"; qual = @("MBBS, MD Cardio", "MBBS, DM", "MBBS, DNB Cardio", "MBBS, MD, FACC") },
    @{name = "Dermatology"; qual = @("MBBS, MD Derma", "MBBS, DVD", "MBBS, DNB Derma", "MBBS, MD, FAAD") },
    @{name = "General Medicine"; qual = @("MBBS", "MBBS, MD", "MBBS, DNB", "MBBS, FCGP") },
    @{name = "Pediatrics"; qual = @("MBBS, MD Peds", "MBBS, DCH", "MBBS, DNB Peds", "MBBS, DCH, DNB") },
    @{name = "Orthopedics"; qual = @("MBBS, MS Ortho", "MBBS, DNB Ortho", "MBBS, MCh Ortho", "MBBS, MS") },
    @{name = "Neurology"; qual = @("MBBS, DM Neuro", "MBBS, MD, DM", "MBBS, DNB Neuro", "MBBS, DM, FRCP") },
    @{name = "Gynecology"; qual = @("MBBS, MS OBG", "MBBS, DNB OBG", "MBBS, DGO", "MBBS, MS, FRCOG") },
    @{name = "ENT"; qual = @("MBBS, MS ENT", "MBBS, DNB ENT", "MBBS, DLO", "MBBS, MS, DLO") },
    @{name = "Ophthalmology"; qual = @("MBBS, MS Ophthal", "MBBS, DO", "MBBS, DNB Ophthal", "MBBS, MS, FICO") },
    @{name = "Psychiatry"; qual = @("MBBS, MD Psych", "MBBS, DPM", "MBBS, DNB Psych", "MBBS, MD, FIPS") },
    @{name = "Dentistry"; qual = @("BDS", "BDS, MDS", "BDS, MDS Ortho", "BDS, MDS Endo") }
)

$baseUrl = "http://localhost:8080/api/doctors"
$startId = 60

for ($i = 1; $i -le 100; $i++) {
    $isFemale = (Get-Random -Maximum 2) -eq 1
    $firstName = if ($isFemale) { $femaleNames | Get-Random } else { $firstNames | Get-Random }
    $lastName = $lastNames | Get-Random
    
    $spec = $specs | Get-Random
    $qual = $spec.qual | Get-Random
    $exp = Get-Random -Minimum 3 -Maximum 26
    
    # Fee based on experience and specialization
    $baseFee = switch ($spec.name) {
        "Cardiology" { 800 }
        "Neurology" { 900 }
        "Orthopedics" { 700 }
        "Gynecology" { 600 }
        "Dermatology" { 500 }
        "Psychiatry" { 700 }
        "Ophthalmology" { 600 }
        "Pediatrics" { 500 }
        "ENT" { 450 }
        "General Medicine" { 350 }
        "Dentistry" { 400 }
        default { 400 }
    }
    $fee = $baseFee + ($exp * 50) + (Get-Random -Maximum 200)
    
    $docId = $startId + $i
    $body = @{
        name            = "Dr. $firstName $lastName"
        email           = "doctor$docId@medicare.com"
        password        = "doctor123"
        phone           = "98" + $docId.ToString().PadLeft(8, '0')
        specialization  = $spec.name
        qualification   = $qual
        experience      = $exp
        consultationFee = $fee
        availableFrom   = @("08:00", "09:00", "10:00") | Get-Random
        availableTo     = @("17:00", "18:00", "19:00") | Get-Random
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $body
        Write-Host "[$i/100] Created: Dr. $firstName $lastName - $($spec.name) ($exp yrs, Rs.$fee)" -ForegroundColor Green
    }
    catch {
        Write-Host "[$i/100] Failed: Dr. $firstName $lastName - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nDone! Added 100 more doctors." -ForegroundColor Cyan
