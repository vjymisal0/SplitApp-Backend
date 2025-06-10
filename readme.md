# Split App - Expense Splitter Backend

## Setup
1. Clone the repository
2. Run`npm install`
3. Add `.env` file with your MongoDB URI
4. Run`npm start`

## API Endpoints
    - `POST /expenses` - Add new expense
        - `GET /expenses` - List all expenses
            - `PUT /expenses/:id` - Update expense
                - `DELETE /expenses/:id` - Delete expense
                    - `GET /people` - List all people
                        - `GET /balances` - Current balance sheet
                            - `GET /settlements` - Simplified settlements

## Deployment
Deploy using[Render](https://render.com) or [Railway](https://railway.app).

## Notes
                            - Add at least 3 people: Shantanu, Sanket, Om
                            - Preload some test expenses for Postman collection
