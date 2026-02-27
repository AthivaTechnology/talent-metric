#!/bin/bash

# Talent Metric - Automated Setup Script
# This script automates the entire setup process for the Developer Appraisal System

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup
main() {
    clear
    print_header "🚀 Talent Metric Setup Script"
    echo "This script will set up the Developer Appraisal System"
    echo ""

    # Check prerequisites
    print_header "📋 Checking Prerequisites"

    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    print_success "Node.js is installed ($(node --version))"

    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    print_success "npm is installed ($(npm --version))"

    if ! command_exists mysql; then
        print_warning "MySQL client not found. Make sure MySQL server is running."
    else
        print_success "MySQL client is installed"
    fi

    # Ask for setup type
    print_header "🎯 Setup Type"
    echo "Choose your setup option:"
    echo "1) Full setup (Backend + Frontend + Database)"
    echo "2) Backend only"
    echo "3) Frontend only"
    echo "4) Database setup only"
    read -p "Enter your choice (1-4): " setup_choice

    case $setup_choice in
        1)
            setup_database
            setup_backend
            setup_frontend
            ;;
        2)
            setup_backend
            ;;
        3)
            setup_frontend
            ;;
        4)
            setup_database
            ;;
        *)
            print_error "Invalid choice. Exiting."
            exit 1
            ;;
    esac

    print_header "🎉 Setup Complete!"
    print_success "All components have been set up successfully!"
    echo ""

    if [ "$setup_choice" == "1" ] || [ "$setup_choice" == "2" ]; then
        echo -e "${GREEN}Backend is ready at:${NC} http://localhost:5000"
        echo -e "${BLUE}To start backend:${NC} cd backend && npm run dev"
    fi

    if [ "$setup_choice" == "1" ] || [ "$setup_choice" == "3" ]; then
        echo -e "${GREEN}Frontend is ready at:${NC} http://localhost:3000"
        echo -e "${BLUE}To start frontend:${NC} cd frontend && npm run dev"
    fi

    echo ""
    echo -e "${YELLOW}Default Admin Credentials:${NC}"
    echo "  Email: admin@company.com"
    echo "  Password: Admin@123"
    echo ""
    echo -e "${BLUE}For more information, check:${NC}"
    echo "  - README.md"
    echo "  - QUICK_START.md"
    echo "  - FRONTEND_COMPLETE_GUIDE.md"
    echo ""
}

setup_database() {
    print_header "🗄️ Setting Up Database"

    echo "Choose database setup method:"
    echo "1) Use Docker (Recommended)"
    echo "2) Use existing MySQL"
    read -p "Enter your choice (1-2): " db_choice

    case $db_choice in
        1)
            if ! command_exists docker; then
                print_error "Docker is not installed. Please install Docker first."
                exit 1
            fi

            print_info "Starting MySQL with Docker..."
            docker-compose up -d
            print_success "Docker MySQL container started"

            print_info "Waiting 30 seconds for MySQL to initialize..."
            sleep 30
            ;;
        2)
            read -p "Enter MySQL host (default: localhost): " db_host
            db_host=${db_host:-localhost}

            read -p "Enter MySQL port (default: 3306): " db_port
            db_port=${db_port:-3306}

            read -p "Enter MySQL root user (default: root): " db_user
            db_user=${db_user:-root}

            read -sp "Enter MySQL root password: " db_password
            echo ""

            print_info "Creating database talent_metric..."
            mysql -h "$db_host" -P "$db_port" -u "$db_user" -p"$db_password" -e "CREATE DATABASE IF NOT EXISTS talent_metric;" 2>/dev/null

            if [ $? -eq 0 ]; then
                print_success "Database created successfully"
            else
                print_error "Failed to create database. Please check your credentials."
                exit 1
            fi
            ;;
        *)
            print_error "Invalid choice. Exiting."
            exit 1
            ;;
    esac
}

setup_backend() {
    print_header "⚙️ Setting Up Backend"

    if [ ! -d "backend" ]; then
        print_error "Backend directory not found. Please run this script from the project root."
        exit 1
    fi

    cd backend

    # Install dependencies
    print_info "Installing backend dependencies..."
    npm install
    print_success "Backend dependencies installed"

    # Setup environment file
    if [ ! -f ".env" ]; then
        print_info "Creating .env file..."
        cp .env.example .env
        print_success ".env file created"

        print_warning "Please update the .env file with your database credentials if needed."
        read -p "Do you want to configure database settings now? (y/n): " configure_db

        if [ "$configure_db" == "y" ]; then
            read -p "Enter DB_HOST (default: localhost): " db_host
            db_host=${db_host:-localhost}

            read -p "Enter DB_PORT (default: 3306): " db_port
            db_port=${db_port:-3306}

            read -p "Enter DB_NAME (default: talent_metric): " db_name
            db_name=${db_name:-talent_metric}

            read -p "Enter DB_USER (default: root): " db_user
            db_user=${db_user:-root}

            read -sp "Enter DB_PASSWORD: " db_password
            echo ""

            # Update .env file
            sed -i.bak "s/DB_HOST=.*/DB_HOST=$db_host/" .env
            sed -i.bak "s/DB_PORT=.*/DB_PORT=$db_port/" .env
            sed -i.bak "s/DB_NAME=.*/DB_NAME=$db_name/" .env
            sed -i.bak "s/DB_USER=.*/DB_USER=$db_user/" .env
            sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=$db_password/" .env
            rm .env.bak

            print_success "Database configuration updated"
        fi
    else
        print_success ".env file already exists"
    fi

    # Seed database
    read -p "Do you want to seed the database with sample data? (y/n): " seed_choice
    if [ "$seed_choice" == "y" ]; then
        print_info "Seeding database..."
        npm run seed
        print_success "Database seeded successfully"
        echo ""
        print_info "Sample users created:"
        echo "  Admin: admin@company.com / Admin@123"
        echo "  Developer: john.doe@company.com / Password@123"
        echo "  Tech Lead: jane.smith@company.com / Password@123"
        echo "  Manager: bob.johnson@company.com / Password@123"
    fi

    cd ..
    print_success "Backend setup complete"
}

setup_frontend() {
    print_header "🎨 Setting Up Frontend"

    if [ ! -d "frontend" ]; then
        print_error "Frontend directory not found. Please run this script from the project root."
        exit 1
    fi

    cd frontend

    # Install dependencies
    print_info "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"

    # Setup environment file
    if [ ! -f ".env" ]; then
        print_info "Creating .env file..."

        read -p "Enter API URL (default: http://localhost:5000/api): " api_url
        api_url=${api_url:-http://localhost:5000/api}

        echo "VITE_API_URL=$api_url" > .env
        print_success ".env file created"
    else
        print_success ".env file already exists"
    fi

    cd ..
    print_success "Frontend setup complete"
}

# Run main function
main
