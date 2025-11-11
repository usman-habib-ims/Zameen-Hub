import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function resetDatabase() {
  console.log('🗑️  Starting Supabase cleanup...\n')

  try {
    // 1. Delete all storage buckets
    console.log('📦 Deleting storage buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
    } else if (buckets) {
      for (const bucket of buckets) {
        console.log(`  - Deleting bucket: ${bucket.name}`)
        const { error } = await supabase.storage.deleteBucket(bucket.name)
        if (error) {
          console.error(`    Error deleting bucket ${bucket.name}:`, error.message)
        } else {
          console.log(`    ✓ Deleted bucket: ${bucket.name}`)
        }
      }
    }

    // 2. Get all tables in the public schema
    console.log('\n🗄️  Fetching all tables from public schema...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .neq('table_name', 'spatial_ref_sys') // Skip PostGIS table

    if (tablesError) {
      console.error('Error fetching tables:', tablesError)
    } else if (tables && tables.length > 0) {
      console.log(`Found ${tables.length} tables to delete\n`)

      // 3. Drop each table
      console.log('🔥 Dropping tables...')
      for (const table of tables) {
        try {
          console.log(`  - Dropping table: ${table.table_name}`)
          const { error } = await supabase.rpc('exec_sql', {
            sql: `DROP TABLE IF EXISTS public."${table.table_name}" CASCADE;`
          })

          if (error) {
            console.error(`    Error dropping table ${table.table_name}:`, error.message)
          } else {
            console.log(`    ✓ Dropped table: ${table.table_name}`)
          }
        } catch (err) {
          console.error(`    Error dropping table ${table.table_name}:`, err)
        }
      }
    } else {
      console.log('No tables found in public schema')
    }

    console.log('\n✅ Supabase cleanup completed!')
    console.log('You can now create new tables and buckets.\n')

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    process.exit(1)
  }
}

resetDatabase()
