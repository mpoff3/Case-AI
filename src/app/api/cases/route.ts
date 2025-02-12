import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connection
  }
});

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT * FROM cases ORDER BY title ASC');
    
    // Transform the data to match the frontend's expected format
    const transformedCases = result.rows.map(row => ({
      case_id: row.case_id,
      title: row.title,
      description: row.content, // Map content to description for frontend compatibility
      // Add any other fields the frontend expects with default values
      file_name: 'placeholder.pdf',
      file_path: '/placeholder',
      is_public: true,
      uploaded_at: new Date().toISOString(),
      uploader_id: 1
    }));

    return NextResponse.json(transformedCases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
} 