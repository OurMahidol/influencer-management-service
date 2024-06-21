# Influencer Management Service

## Overview

This project is a web service application used for searching, creating, updating, and deleting influencer/KOL data. It also includes an authentication service to manage user access.

## Features

- User authentication (sign in and register)
- CRUD operations for KOL (Key Opinion Leader) data
- Authenticated API requests
- Unit testing for all services
- Dockerized application and database setup

## Endpoints

### Authentication

- **Sign in**: Request with credentials to get an access token
- **Register**: Create a new user and return success status with a message

### KOL Management (Authenticated)

- **Search KOL**: Return a list of KOLs, with pagination support
- **Create KOL**: Add a new KOL and return success status with a message
- **Update KOL**: Update an existing KOL and return success status with a message
- **Delete KOL**: Delete a KOL and return success status with a message

## KOL Data Structure Example

```json
{
    "Name": "Ninejoe Ninejoe",
    "Platform": "Facebook",
    "Sex": "Male",
    "Categories": ["Lifestyle"],
    "Tel": "0998935365",
    "Link": "https://www.facebook.com/tsomton?mibextid=LQQJ4d",
    "Followers": "7900",
    "Photo Cost / Kols": 800,
    "VDO Cost / Kols": 1000,
    "ER%": 2.12
}
```

## Technical Requirements

- **Languages**: Node.js
- **Frameworks**: Express.js
- **Database**: DynamoDB
- **Containerization**: Docker
- **Version Control**: Git
- **Testing**: Jest

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed
- Node.js and npm installed

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/OurMahidol/influencer-management-service.git
    cd influencer-management
    ```

2. Install the dependencies:

    ```sh
    npm install
    ```

3. Start the application locally:

    ```sh
    npm start
    ```

### Running the Application

1. Start the application using Docker Compose:

    ```sh
    docker-compose up
    ```

2. The application should now be running at `http://localhost:3000`.

### Running Tests

To run the unit tests, use the following command:

```sh
npm test
```

## Deployment

(Optional) Deploy the application to a cloud provider such as Heroku, AWS, Google Cloud, or Digital Ocean.

## Contributing

If you want to contribute to this project, please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature-branch`)
6. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions, feel free to reach out to us at wiwatsilarak@hotmail.com.

```