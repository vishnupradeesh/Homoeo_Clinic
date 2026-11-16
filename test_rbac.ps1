$base = "http://127.0.0.1:8000/api"
function Login($u,$p){ (Invoke-RestMethod -Uri "$base/auth/login" -Method Post -Body (@{username=$u;password=$p}|ConvertTo-Json) -ContentType "application/json").access_token }

# 1. Admin login
$admin = Login "admin" "Madurai@2023"
"1. Admin token acquired: $([bool]$admin)"

# 2. Admin creates a patient user
$h = @{ Authorization = "Bearer $admin" }
try { Invoke-RestMethod -Uri "$base/users" -Method Post -ContentType "application/json" -Headers $h -Body (@{username="patient1";password="Patient@123";role="PATIENT"}|ConvertTo-Json) | ConvertTo-Json; "2. patient1 created" } catch { "2. create patient1: " + $_.ErrorDetails.Message }

# 3. Patient login
$pat = Login "patient1" "Patient@123"
$ph = @{ Authorization = "Bearer $pat" }
"3. Patient token acquired: $([bool]$pat)"

# 4. Patient books an appointment (should succeed)
try { Invoke-RestMethod -Uri "$base/appointments" -Method Post -ContentType "application/json" -Headers $ph -Body (@{name="Ravi";email="ravi@example.com";phone="+91 90000 11111";preferred_date="2026-09-05";message="Checkup"}|ConvertTo-Json) | ConvertTo-Json; "4. patient booked appointment OK" } catch { "4. patient book FAILED: " + $_.ErrorDetails.Message }

# 5. Patient views own appointments (should succeed)
try { (Invoke-RestMethod -Uri "$base/appointments/mine" -Method Get -Headers $ph) | ConvertTo-Json; "5. patient mine OK" } catch { "5. patient mine FAILED: " + $_.ErrorDetails.Message }

# 6. Patient tries to list ALL appointments (should be 403 forbidden)
try { Invoke-RestMethod -Uri "$base/appointments" -Method Get -Headers $ph; "6. ERROR patient should NOT see all" } catch { "6. patient blocked from all-appointments as expected: " + $_.Exception.Response.StatusCode }

# 7. Patient tries to create a user (should be 403)
try { Invoke-RestMethod -Uri "$base/users" -Method Get -Headers $ph; "7. ERROR patient should NOT list users" } catch { "7. patient blocked from users as expected: " + $_.Exception.Response.StatusCode }

# 8. Doctor (drsmith created earlier) login and view all appointments
$doc = Login "drsmith" "Doctor@123"
$dh = @{ Authorization = "Bearer $doc" }
try { (Invoke-RestMethod -Uri "$base/appointments" -Method Get -Headers $dh).Count; "8. doctor sees all appointments OK" } catch { "8. doctor all FAILED: " + $_.ErrorDetails.Message }

# 9. Doctor manages tasks (should succeed)
try { (Invoke-RestMethod -Uri "$base/tasks" -Method Get -Headers $dh).Count; "9. doctor tasks OK" } catch { "9. doctor tasks FAILED: " + $_.ErrorDetails.Message }

# 10. Doctor tries to create a user (should be 403)
try { Invoke-RestMethod -Uri "$base/users" -Method Get -Headers $dh; "10. ERROR doctor should NOT list users" } catch { "10. doctor blocked from users as expected: " + $_.Exception.Response.StatusCode }
