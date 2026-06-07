@echo off
echo Starting SkyLink Microservices...

echo Starting Gateway...
start "SkyLink Gateway" cmd /k "dotnet run --project SkyLink.Gateway"

echo Starting Auth Service...
start "SkyLink Auth Service" cmd /k "dotnet run --project SkyLink.AuthService"

echo Starting Flight Service...
start "SkyLink Flight Service" cmd /k "dotnet run --project SkyLink.FlightService"

echo Starting Booking Service...
start "SkyLink Booking Service" cmd /k "dotnet run --project SkyLink.BookingService"

echo Starting Notification Service...
start "SkyLink Notification Service" cmd /k "dotnet run --project SkyLink.NotificationService"

echo All microservices are starting in new command windows.
pause
