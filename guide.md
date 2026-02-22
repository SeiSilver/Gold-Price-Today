### 🚀 The Master Prompt

**Role:** You are an expert Full-stack Developer.
**Goal:** Create a Monolithic Node.js web application to track gold prices from the Bao Tin Minh Chau (BTMC) API, store data in PostgreSQL, and display it with a Bootstrap UI featuring a Line Graph.

**Technical Stack:**

* **Backend:** Node.js, Express.
* **Database:** PostgreSQL (using `pg` library).
* **Automation:** `node-cron` for daily data fetching.
* **Frontend:** EJS, Bootstrap 5, Chart.js.
* **Utilities:** `axios` (API calls), `moment` (date parsing).

**1. Data Source & API Specs:**

* **Endpoint:** `http://api.btmc.vn/api/BTMCAPI/getpricebtmc?key=3kd8ub1llcg9t45hnoh8hmn7t5kc2v`
* **Response Mapping (based on provided schema):**
* `@n_1`: Gold Name (e.g., "NHẪN TRÒN TRƠN (Vàng Rồng Thăng Long)")
* `@k_1`: Karat (e.g., "24k")
* `@pb_1`: Buy Price (String to be converted to BigInt)
* `@ps_1`: Sell Price (String to be converted to BigInt)
* `@pt_1`: World Price
* `@d_1`: Recorded Time (Format: `DD/MM/YYYY HH:mm`)



**2. Database Schema:**
Create a table named `gold_prices` with columns: `id` (serial), `name` (varchar), `karat` (varchar), `buy_price` (bigint), `sell_price` (bigint), `world_price` (varchar), and `recorded_at` (timestamp).

**3. Key Tasks to Implement:**

* **Data Fetching Job:** Implement a cron job that runs daily at 8:00 AM. It must fetch data from the API, parse the date using `moment`, and insert the records into PostgreSQL.
* **Backend Routes:** - `GET /`: Fetch the latest prices for the dashboard and historical data (last 30 entries) for the specific gold type "NHẪN TRÒN TRƠN" to feed the chart.
* **Frontend UI (UX focus):**
* A clean, responsive Bootstrap 5 dashboard.
* A **Line Graph** using **Chart.js** to visualize the trend of "Sell Price" over time. Ensure the Y-axis does not start at zero to highlight price fluctuations.
* A summary table showing the most recent gold rates.



**4. Deliverables:**

* Provide the SQL schema.
* Provide a single-file `server.js` (Monolithic approach) including Express logic, DB connection, and Cron Job.
* Provide the `views/index.ejs` file for the frontend.
* Include a `package.json` with necessary dependencies.