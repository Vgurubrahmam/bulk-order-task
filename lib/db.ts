import { Pool } from "pg"

// Create a new pool instance with better error handling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Test the connection on startup
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err)
})

// Helper function to execute SQL queries with better error handling
export async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    const start = Date.now()
    const res = await client.query(text, params)
    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Error executing query", { text, error })
    throw error
  } finally {
    client.release()
  }
}

// Initialize database tables with better error handling
export async function initializeDatabase() {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        buyer_name VARCHAR(255) NOT NULL,
        contact_info VARCHAR(255) NOT NULL,
        delivery_address TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query("COMMIT")
    console.log("Database initialized successfully")
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Error initializing database", error)
    throw error
  } finally {
    client.release()
  }
}

// Function to check if database is initialized
export async function isDatabaseInitialized() {
  try {
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      );
    `)
    return result.rows[0].exists
  } catch (error) {
    console.error("Error checking database initialization:", error)
    return false
  }
}
