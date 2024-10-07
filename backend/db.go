package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

var DB *sql.DB

func isRunningInDockerContainer() bool {
	// docker creates a .dockerenv file at the root
	// of the directory tree inside the container.
	// if this file exists then the viewer is running
	// from inside a container so return true

	if _, err := os.Stat("/.dockerenv"); err == nil {
		return true
	}

	return false
}

func init() {
	// Set up PostgreSQL connection
	var err error
	host := "postgres"
	if !isRunningInDockerContainer() {
		host = "localhost"
	}
	connStr := "host=" + host + " user=postgres dbname=learningdb sslmode=disable password=123456"
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	// Test the connection
	if err = DB.Ping(); err != nil {
		log.Fatal("Could not connect to the database:", err.Error())
	}
	//getdata()
	log.Println("Connected to PostgreSQL database successfully!")
}
func getdata() {
	fmt.Println("Alok")
	var storedPasswordHash string
	err := DB.QueryRow("SELECT password_hash FROM users WHERE username = $1", "aloksonker2").Scan(&storedPasswordHash)
	if err != nil {
		//http.Error(w, "User not found", http.StatusUnauthorized)
		fmt.Println("error ", err)
		return
	}
	// Compare the stored hash with the provided password
	if err := bcrypt.CompareHashAndPassword([]byte(storedPasswordHash), []byte("123")); err != nil {
		//http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		fmt.Println("got error ", err)
		return
	}
	fmt.Println("Looing fine")

	return

	rows, err := DB.Query(`SELECT id, first_name, last_name, username, email, password_hash, "role", mobile_number, address1, address2, profile_picture_url, created_at, updated_at FROM users WHERE username = $1`, "aloksonker1")
	if err != nil {
		fmt.Println("Error ", err)
	}
	defer rows.Close()
	//fmt.Println("Jack", count(rows))
	//var completedCourses []int
	var user [1]User
	fmt.Println("jj ", user)
	for rows.Next() {
		var id int
		rows.Scan(&user[0].ID, &user[0].FirstName, &user[0].LastName, &user[0].Username, &user[0].Email, &user[0].Password, &user[0].Role, &user[0].MobileNumber, &user[0].Address1, &user[0].Address2, &user[0].ProfilePictureURL, &user[0].CreatedAt, &user[0].UpdatedAt)
		//rows.Scan(&id)
		// completedCourses = append(completedCourses, courseID)
		fmt.Println("alok", id, user[0])
	}

	fmt.Println("alok", user[0].Address1)
	//json.NewEncoder(w).Encode(completedCourses)
}
