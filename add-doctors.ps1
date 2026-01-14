# Add 50 Doctors to MediCare

$doctors = @(
    # Cardiology (6 doctors)
    @{name="Dr. Vikram Patel"; specialization="Cardiology"; qualification="MBBS, MD, DM"; experience=18; fee=1500},
    @{name="Dr. Sunita Reddy"; specialization="Cardiology"; qualification="MBBS, DNB Cardio"; experience=12; fee=1200},
    @{name="Dr. Arjun Kapoor"; specialization="Cardiology"; qualification="MBBS, MD"; experience=8; fee=900},
    @{name="Dr. Meera Shah"; specialization="Cardiology"; qualification="MBBS, DM"; experience=15; fee=1400},
    @{name="Dr. Rahul Verma"; specialization="Cardiology"; qualification="MBBS, MD, FACC"; experience=20; fee=2000},
    @{name="Dr. Kavitha Nair"; specialization="Cardiology"; qualification="MBBS, DNB"; experience=6; fee=800},
    
    # Dermatology (5 doctors)
    @{name="Dr. Ananya Sharma"; specialization="Dermatology"; qualification="MBBS, MD Derma"; experience=10; fee=800},
    @{name="Dr. Kiran Desai"; specialization="Dermatology"; qualification="MBBS, DVD"; experience=7; fee=600},
    @{name="Dr. Pooja Mehta"; specialization="Dermatology"; qualification="MBBS, MD"; experience=12; fee=1000},
    @{name="Dr. Sanjay Gupta"; specialization="Dermatology"; qualification="MBBS, DNB Derma"; experience=5; fee=500},
    @{name="Dr. Ritu Bansal"; specialization="Dermatology"; qualification="MBBS, MD, FAAD"; experience=15; fee=1200},
    
    # General Medicine (6 doctors)
    @{name="Dr. Arun Kumar"; specialization="General Medicine"; qualification="MBBS, MD"; experience=20; fee=700},
    @{name="Dr. Sneha Pillai"; specialization="General Medicine"; qualification="MBBS"; experience=5; fee=400},
    @{name="Dr. Mohan Das"; specialization="General Medicine"; qualification="MBBS, FCGP"; experience=25; fee=800},
    @{name="Dr. Lakshmi Iyer"; specialization="General Medicine"; qualification="MBBS, MD"; experience=10; fee=500},
    @{name="Dr. Rajiv Saxena"; specialization="General Medicine"; qualification="MBBS"; experience=8; fee=450},
    @{name="Dr. Deepa Menon"; specialization="General Medicine"; qualification="MBBS, DNB"; experience=12; fee=600},
    
    # Pediatrics (5 doctors)
    @{name="Dr. Smita Joshi"; specialization="Pediatrics"; qualification="MBBS, MD Peds"; experience=14; fee=900},
    @{name="Dr. Rohit Malhotra"; specialization="Pediatrics"; qualification="MBBS, DCH"; experience=9; fee=700},
    @{name="Dr. Neha Aggarwal"; specialization="Pediatrics"; qualification="MBBS, DNB Peds"; experience=6; fee=600},
    @{name="Dr. Vivek Chopra"; specialization="Pediatrics"; qualification="MBBS, MD"; experience=16; fee=1100},
    @{name="Dr. Priyanka Roy"; specialization="Pediatrics"; qualification="MBBS, DCH, DNB"; experience=11; fee=850},
    
    # Orthopedics (5 doctors)
    @{name="Dr. Suresh Rao"; specialization="Orthopedics"; qualification="MBBS, MS Ortho"; experience=18; fee=1300},
    @{name="Dr. Amit Bhatt"; specialization="Orthopedics"; qualification="MBBS, DNB Ortho"; experience=10; fee=1000},
    @{name="Dr. Harish Kumar"; specialization="Orthopedics"; qualification="MBBS, MS"; experience=7; fee=800},
    @{name="Dr. Radha Krishnan"; specialization="Orthopedics"; qualification="MBBS, MCh Ortho"; experience=22; fee=1800},
    @{name="Dr. Nisha Patil"; specialization="Orthopedics"; qualification="MBBS, MS"; experience=5; fee=700},
    
    # Neurology (4 doctors)
    @{name="Dr. Ashok Sinha"; specialization="Neurology"; qualification="MBBS, DM Neuro"; experience=20; fee=2000},
    @{name="Dr. Vandana Rao"; specialization="Neurology"; qualification="MBBS, MD, DM"; experience=15; fee=1700},
    @{name="Dr. Manoj Tiwari"; specialization="Neurology"; qualification="MBBS, DNB Neuro"; experience=8; fee=1200},
    @{name="Dr. Shweta Kulkarni"; specialization="Neurology"; qualification="MBBS, DM"; experience=12; fee=1500},
    
    # Gynecology (5 doctors)
    @{name="Dr. Rekha Mishra"; specialization="Gynecology"; qualification="MBBS, MS OBG"; experience=16; fee=1000},
    @{name="Dr. Sunanda Devi"; specialization="Gynecology"; qualification="MBBS, DNB OBG"; experience=9; fee=800},
    @{name="Dr. Pallavi Singh"; specialization="Gynecology"; qualification="MBBS, MD"; experience=12; fee=900},
    @{name="Dr. Geeta Rani"; specialization="Gynecology"; qualification="MBBS, DGO"; experience=20; fee=1200},
    @{name="Dr. Manisha Agarwal"; specialization="Gynecology"; qualification="MBBS, MS, FRCOG"; experience=25; fee=1500},
    
    # ENT (4 doctors)
    @{name="Dr. Prakash Jain"; specialization="ENT"; qualification="MBBS, MS ENT"; experience=14; fee=700},
    @{name="Dr. Savita Sharma"; specialization="ENT"; qualification="MBBS, DNB ENT"; experience=8; fee=600},
    @{name="Dr. Gaurav Mishra"; specialization="ENT"; qualification="MBBS, MS"; experience=6; fee=500},
    @{name="Dr. Anuradha Nayak"; specialization="ENT"; qualification="MBBS, MS, DLO"; experience=18; fee=900},
    
    # Ophthalmology (4 doctors)
    @{name="Dr. Ramesh Iyer"; specialization="Ophthalmology"; qualification="MBBS, MS Ophthal"; experience=22; fee=1100},
    @{name="Dr. Sudha Murthy"; specialization="Ophthalmology"; qualification="MBBS, DNB Ophthal"; experience=10; fee=800},
    @{name="Dr. Vijay Shekhar"; specialization="Ophthalmology"; qualification="MBBS, DO"; experience=7; fee=600},
    @{name="Dr. Aparna Reddy"; specialization="Ophthalmology"; qualification="MBBS, MS, FICO"; experience=15; fee=1000},
    
    # Psychiatry (3 doctors)
    @{name="Dr. Rajendra Prasad"; specialization="Psychiatry"; qualification="MBBS, MD Psych"; experience=18; fee=1500},
    @{name="Dr. Seema Bhargava"; specialization="Psychiatry"; qualification="MBBS, DPM"; experience=10; fee=1000},
    @{name="Dr. Anil Verma"; specialization="Psychiatry"; qualification="MBBS, MD"; experience=8; fee=800},
    
    # Dentistry (4 doctors)
    @{name="Dr. Sunil Mathur"; specialization="Dentistry"; qualification="BDS, MDS"; experience=12; fee=600},
    @{name="Dr. Neelam Khanna"; specialization="Dentistry"; qualification="BDS"; experience=6; fee=400},
    @{name="Dr. Pankaj Sharma"; specialization="Dentistry"; qualification="BDS, MDS Ortho"; experience=10; fee=700},
    @{name="Dr. Divya Kapoor"; specialization="Dentistry"; qualification="BDS, MDS Endo"; experience=8; fee=550}
)

$baseUrl = "http://localhost:8080/api/doctors"
$counter = 1

foreach ($doc in $doctors) {
    $body = @{
        name = $doc.name
        email = "doctor$counter@medicare.com"
        password = "doctor123"
        phone = "98765" + $counter.ToString().PadLeft(5, '0')
        specialization = $doc.specialization
        qualification = $doc.qualification
        experience = $doc.experience
        consultationFee = $doc.fee
        availableFrom = "09:00"
        availableTo = "17:00"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $baseUrl -Method POST -ContentType "application/json" -Body $body
        Write-Host "[$counter/50] Created: $($doc.name) - $($doc.specialization)" -ForegroundColor Green
    } catch {
        Write-Host "[$counter/50] Failed: $($doc.name) - $($_.Exception.Message)" -ForegroundColor Red
    }
    
    $counter++
}

Write-Host "`nDone! Added $($counter - 1) doctors." -ForegroundColor Cyan
