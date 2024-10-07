package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

// Course struct now includes TopicDetail field for more detailed content
type Course struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Desc        string `json:"desc"`
	TopicDetail string `json:"topicDetail"` // New field for detailed content
}

var jwtSecret = []byte("MYNAMEISALOK")

// User struct now includes the new fields
type User struct {
	ID                int    `json:"id"`
	FirstName         string `json:"first_name"`
	LastName          string `json:"last_name"`
	Username          string `json:"username"`
	Email             string `json:"email"`
	Password          string `json:"password"` // Password will be used only for input, not output
	Role              string `json:"role"`
	MobileNumber      string `json:"mobile_number,omitempty"`
	Address1          string `json:"address1,omitempty"`
	Address2          string `json:"address2,omitempty"`
	ProfilePictureURL string `json:"profile_picture_url,omitempty"`
	CreatedAt         string `json:"created_at"`
	UpdatedAt         string `json:"updated_at"`
}

type Credentials struct {
	Username string `json:"username"` // The username of the user
	Password string `json:"password"` // The plain text password provided by the user
}

// Claims struct for JWT token
type Claims struct {
	Username           string `json:"username"` // The username stored in the token
	jwt.StandardClaims        // Standard JWT claims such as expiration
}

func GetUserProfile(w http.ResponseWriter, r *http.Request) {
	// Ensure the request contains a valid JWT token
	tokenStr := r.Header.Get("Authorization")
	if len(tokenStr) > 7 && strings.HasPrefix(tokenStr, "Bearer ") {
		tokenStr = strings.TrimPrefix(tokenStr, "Bearer ")
	}
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil // Ensure you are using the correct secret
	})

	if err != nil || !token.Valid {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	// Query the database to get user details
	var user User
	err = DB.QueryRow("SELECT id, first_name, last_name, username, email, mobile_number, address1, address2 FROM users WHERE username = $1", claims.Username).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Username, &user.Email, &user.MobileNumber, &user.Address1, &user.Address2)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Return the user's profile data
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func UpdateUserProfile(w http.ResponseWriter, r *http.Request) {
	// Ensure the request contains a valid JWT token
	tokenStr := r.Header.Get("Authorization")
	claims := &Claims{}
	if len(tokenStr) > 7 && strings.HasPrefix(tokenStr, "Bearer ") {
		tokenStr = strings.TrimPrefix(tokenStr, "Bearer ")
	}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var userUpdates struct {
		FirstName         string `json:"first_name"`
		LastName          string `json:"last_name"`
		Email             string `json:"email"`
		Password          string `json:"password"`
		MobileNumber      string `json:"mobile_number"`
		Address1          string `json:"address1"`
		Address2          string `json:"address2"`
		ProfilePictureURL string `json:"profile_picture_url"`
	}

	if err := json.NewDecoder(r.Body).Decode(&userUpdates); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Hash the new password if provided
	var hashedPassword string
	if userUpdates.Password != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(userUpdates.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Could not hash password", http.StatusInternalServerError)
			return
		}
		hashedPassword = string(hash)
	}

	// Update the user's details
	query := `
        UPDATE users
        SET first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            email = COALESCE($3, email),
            password_hash = COALESCE($4, password_hash),
            mobile_number = COALESCE($5, mobile_number),
            address1 = COALESCE($6, address1),
            address2 = COALESCE($7, address2),
            profile_picture_url = COALESCE($8, profile_picture_url),
            updated_at = CURRENT_TIMESTAMP
        WHERE username = $9`
	_, err = DB.Exec(query, userUpdates.FirstName, userUpdates.LastName, userUpdates.Email, hashedPassword, userUpdates.MobileNumber, userUpdates.Address1, userUpdates.Address2, userUpdates.ProfilePictureURL, claims.Username)
	if err != nil {
		http.Error(w, "Could not update profile", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode("Profile updated successfully")
}

func Login(w http.ResponseWriter, r *http.Request) {
	var creds Credentials

	// Parse the login credentials from the request body
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Trim any spaces from the provided username and password
	creds.Password = strings.TrimSpace(creds.Password)
	creds.Username = strings.TrimSpace(creds.Username)

	// Query the database to get the hashed password for the user
	var storedPasswordHash string
	err := DB.QueryRow("SELECT password_hash FROM users WHERE username = $1", creds.Username).Scan(&storedPasswordHash)
	if err != nil {
		if err == sql.ErrNoRows {
			// User not found
			http.Error(w, "User not found", http.StatusUnauthorized)
			return
		}
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	fmt.Println("Cred ", creds, "-", storedPasswordHash)

	// Compare the stored hash with the provided password
	err = bcrypt.CompareHashAndPassword([]byte(storedPasswordHash), []byte(creds.Password))
	if err != nil {
		// If the comparison fails, return unauthorized
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// User successfully logged in, proceed with JWT generation
	expirationTime := time.Now().Add(1 * time.Hour)
	claims := &Claims{
		Username: creds.Username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		http.Error(w, "Could not generate token", http.StatusInternalServerError)
		return
	}

	// Return the token to the user
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}

func RegisterUser(w http.ResponseWriter, r *http.Request) {
	var user User

	// Parse and decode the request body into the User struct
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Trim any spaces from the password and other fields
	user.Password = strings.TrimSpace(user.Password)

	// Hash the password before storing it in the database
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Could not hash password", http.StatusInternalServerError)
		return
	}
	fmt.Println("Details ", user, "-", string(hashedPassword))

	// Insert the new user into the database
	query := `
        INSERT INTO users (first_name, last_name, username, email, password_hash, mobile_number, address1, address2, role, profile_picture_url) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
	_, err = DB.Exec(query, user.FirstName, user.LastName, user.Username, user.Email, string(hashedPassword), user.MobileNumber, user.Address1, user.Address2, user.Role, user.ProfilePictureURL)
	if err != nil {
		http.Error(w, "Could not create user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode("User created successfully")
}

func SaveProgress(w http.ResponseWriter, r *http.Request) {
	userID := r.FormValue("user_id")
	courseID := r.FormValue("course_id")

	query := `INSERT INTO progress (user_id, course_id) VALUES ($1, $2)`
	_, err := DB.Exec(query, userID, courseID)
	if err != nil {
		http.Error(w, "Could not save progress", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// SaveQuizScore saves the quiz score in the database
func SaveQuizScore(w http.ResponseWriter, r *http.Request) {
	userID := r.FormValue("user_id")
	courseID := r.FormValue("course_id")
	score := r.FormValue("score")

	query := `INSERT INTO quiz_scores (user_id, course_id, score) VALUES ($1, $2, $3)`
	_, err := DB.Exec(query, userID, courseID, score)
	if err != nil {
		http.Error(w, "Could not save quiz score", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// GetProgress fetches the user's completed courses
func GetProgress(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")

	rows, err := DB.Query(`SELECT course_id FROM progress WHERE user_id = $1`, userID)
	if err != nil {
		http.Error(w, "Could not fetch progress", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var completedCourses []int
	for rows.Next() {
		var courseID int
		rows.Scan(&courseID)
		completedCourses = append(completedCourses, courseID)
	}

	json.NewEncoder(w).Encode(completedCourses)
}

// GetQuizScores fetches the user's quiz scores
func GetQuizScores(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")

	rows, err := DB.Query(`SELECT course_id, score FROM quiz_scores WHERE user_id = $1`, userID)
	if err != nil {
		http.Error(w, "Could not fetch quiz scores", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var quizScores = make(map[int]int)
	for rows.Next() {
		var courseID, score int
		rows.Scan(&courseID, &score)
		quizScores[courseID] = score
	}

	json.NewEncoder(w).Encode(quizScores)
}

// getCourses handles the GET request to return a list of courses
func getCourses(w http.ResponseWriter, r *http.Request) {
	courses := []Course{
		{ID: 1, Title: "Go Basics", Desc: "Learn the fundamentals of Go"},
		{ID: 2, Title: "Advanced Go", Desc: "Dive deeper into Go programming"},
		{ID: 3, Title: "Concurrency in Go", Desc: "Learn Goroutines and concurrency"},
		{ID: 4, Title: "Go Channels", Desc: "Master Go channels and the select statement"},
		{ID: 5, Title: "Error Handling in Go", Desc: "Learn effective error handling techniques"},
		{ID: 6, Title: "Go Modules", Desc: "Package management with Go modules"},
		{ID: 7, Title: "Building HTTP Web Services", Desc: "Build APIs and web services with Go"},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(courses)
}

// getCourse handles the GET request to return a single course by ID
func getCourse(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var course Course
	if id == "1" {
		course = Course{
			ID:          1,
			Title:       "Go Basics",
			Desc:        "Learn the fundamentals of Go",
			TopicDetail: "Go Basics covers topics like variables, types, functions, control structures (loops, if statements), and basic error handling. You'll also learn how to define structs and work with collections like slices and maps. Functions in Go support multiple return values, and Go's type inference makes code both flexible and easy to read."}
	} else if id == "2" {
		course = Course{
			ID:          2,
			Title:       "Advanced Go",
			Desc:        "Dive deeper into Go programming",
			TopicDetail: "In Advanced Go, you'll explore pointers, which allow you to reference memory addresses directly, and how to use them in structs and functions. You'll also learn about interfaces, which allow for flexible and modular design by defining behaviors rather than concrete implementations. Additionally, you will explore Go's testing capabilities and package management."}
	} else if id == "3" {
		course = Course{
			ID:          3,
			Title:       "Concurrency in Go",
			Desc:        "Learn Goroutines and concurrency",
			TopicDetail: "Go's built-in concurrency model is one of its most powerful features. Concurrency in Go is managed using Goroutines, which are lightweight threads managed by the Go runtime. Using the 'go' keyword, you can launch Goroutines that run concurrently. By leveraging Goroutines, you can easily build applications that perform multiple tasks simultaneously."}
	} else if id == "4" {
		course = Course{
			ID:          4,
			Title:       "Go Channels",
			Desc:        "Master Go channels and the select statement",
			TopicDetail: "Channels provide a way for Goroutines to communicate with each other and synchronize their execution. They allow you to pass data between Goroutines safely. You can use channels to send and receive values, and the select statement helps you wait on multiple channel operations simultaneously. Mastering channels is key to effective concurrent programming in Go."}
	} else if id == "5" {
		course = Course{
			ID:          5,
			Title:       "Error Handling in Go",
			Desc:        "Learn effective error handling techniques",
			TopicDetail: "Go uses a simple yet powerful error handling model based on multiple return values. A function can return both a result and an error value. If an error occurs, the error return value is non-nil. Error handling in Go is explicit, which encourages developers to handle errors carefully. You'll also explore custom error types and the use of the 'errors' package."}
	} else if id == "6" {
		course = Course{
			ID:          6,
			Title:       "Go Modules",
			Desc:        "Package management with Go modules",
			TopicDetail: "Go Modules provide an easy way to manage dependencies in your Go projects. Using Go Modules, you can define your project’s dependencies in a go.mod file, making it easy to build reproducible environments. Modules handle versioning, so you can update or downgrade dependencies reliably. This system ensures that you can maintain stable builds across different environments."}
	} else if id == "7" {
		course = Course{
			ID:          7,
			Title:       "Building HTTP Web Services",
			Desc:        "Build APIs and web services with Go",
			TopicDetail: "Go is a powerful language for building HTTP servers and web services. The net/http package provides everything you need to create robust APIs. You’ll learn how to create a web server, handle requests, and route them using handlers. You'll also explore JSON encoding and decoding, making Go ideal for building RESTful APIs."}
	} else {
		http.Error(w, "Course not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(course)
}

// submitQuiz handles the POST request to submit a quiz
func submitQuiz(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Quiz submitted!"))
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get the token from the Authorization header
		tokenStr := r.Header.Get("Authorization")
		if tokenStr == "" {
			log.Println("Authorization header is missing")
			http.Error(w, "Authorization header missing", http.StatusUnauthorized)
			return
		}

		// Remove "Bearer " prefix if present
		tokenStr = strings.TrimPrefix(tokenStr, "Bearer ")

		// Log the token for debugging
		log.Println("Received token:", tokenStr)

		// Parse the token
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil // Ensure you are using the correct secret
		})

		if err != nil {
			log.Println("Token parsing error:", err)
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		if !token.Valid {
			log.Println("Token is invalid")
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Log the valid token and username
		log.Println("Valid token for user:", claims.Username)

		// Proceed to the next handler if the token is valid
		next.ServeHTTP(w, r)
	})
}

func main() {
	print("alok")
	router := mux.NewRouter()

	router.HandleFunc("/api/courses", getCourses).Methods("GET")
	router.HandleFunc("/api/courses/{id}", getCourse).Methods("GET")
	router.HandleFunc("/api/quiz/{id}", submitQuiz).Methods("POST")
	// Routes for progress and quiz scores
	router.HandleFunc("/api/progress", GetProgress).Methods("GET")       // Get course progress
	router.HandleFunc("/api/progress", SaveProgress).Methods("POST")     // Save course progress
	router.HandleFunc("/api/quiz-scores", GetQuizScores).Methods("GET")  // Get quiz scores
	router.HandleFunc("/api/quiz-scores", SaveQuizScore).Methods("POST") // Save quiz scores

	// Public routes (no authentication required)
	router.HandleFunc("/api/register", RegisterUser).Methods("POST") // User registration
	router.HandleFunc("/api/login", Login).Methods("POST")           // User login

	// Protected routes (JWT authentication required)
	protected := router.PathPrefix("/api").Subrouter()
	protected.Use(AuthMiddleware)                                      // Apply authentication middleware
	protected.HandleFunc("/profile", GetUserProfile).Methods("GET")    // Add GET method for profile retrieval
	protected.HandleFunc("/profile", UpdateUserProfile).Methods("PUT") // Update user profile

	// Allow CORS from localhost:3000 (React app)
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:3000", "http://localhost:3001"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)(router)
	fmt.Println("listening :8080")

	http.ListenAndServe(":8080", corsHandler)
	fmt.Println("listening :8080")
}

// package main

// import (
// 	"fmt"

// 	"golang.org/x/crypto/bcrypt"
// )

// func main() {
// 	password := "1234567890"

// 	// Generate the bcrypt hash of the password
// 	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
// 	if err != nil {
// 		fmt.Println("Error generating hash:", err)
// 		return
// 	}

// 	fmt.Println("Hashed password:", string(hashedPassword))

// 	// Now compare the password with the hashed password
// 	err = bcrypt.CompareHashAndPassword(hashedPassword, []byte(password))
// 	if err != nil {
// 		fmt.Println("Password does not match:", err)
// 	} else {
// 		fmt.Println("Password matches!")
// 	}
// }
