/**
 * ONE-TIME DATA MIGRATION SCRIPT
 * ================================
 * Copies all existing data from the original `voting_system` database
 * into the three distributed databases:
 *   voting_system  →  db_auth      (users, auditlogs)
 *   voting_system  →  db_election  (elections, parties, candidates, contactmessages)
 *   voting_system  →  db_voting    (finalvotes, votes, votelogs, partyvotes)
 *
 * SAFE TO RUN MULTIPLE TIMES — uses upsert so no duplicates are created.
 * Original voting_system database is NEVER modified or deleted.
 *
 * Usage:
 *   node migrate.js
 */

const mongoose = require('mongoose');

const SOURCE_URI   = 'mongodb://127.0.0.1:27017/voting_system';
const AUTH_URI     = 'mongodb://127.0.0.1:27017/db_auth';
const ELECTION_URI = 'mongodb://127.0.0.1:27017/db_election';
const VOTING_URI   = 'mongodb://127.0.0.1:27017/db_voting';

async function migrate() {
  console.log('=================================================');
  console.log(' Online Voting System – Data Migration');
  console.log('=================================================\n');

  // ── Connect to all 4 databases ──────────────────────────
  console.log('Connecting to databases...');

  const sourceConn   = await mongoose.createConnection(SOURCE_URI).asPromise();
  const authConn     = await mongoose.createConnection(AUTH_URI).asPromise();
  const electionConn = await mongoose.createConnection(ELECTION_URI).asPromise();
  const votingConn   = await mongoose.createConnection(VOTING_URI).asPromise();

  console.log('✅ Connected to all 4 databases\n');

  // ── Helper: copy a collection with upsert ───────────────
  async function copyCollection(sourceDb, targetDb, collectionName) {
    try {
      const sourceColl = sourceDb.collection(collectionName);
      const targetColl = targetDb.collection(collectionName);

      const docs = await sourceColl.find({}).toArray();
      if (docs.length === 0) {
        console.log(`   ⚠️  ${collectionName}: 0 documents found in source — skipping`);
        return 0;
      }

      let copied = 0;
      for (const doc of docs) {
        await targetColl.replaceOne(
          { _id: doc._id },
          doc,
          { upsert: true }
        );
        copied++;
      }
      console.log(`   ✅ ${collectionName}: ${copied} documents migrated`);
      return copied;
    } catch (err) {
      console.log(`   ❌ ${collectionName}: ERROR – ${err.message}`);
      return 0;
    }
  }

  // ── Migrate to db_auth ───────────────────────────────────
  console.log('📦 Migrating to db_auth...');
  await copyCollection(sourceConn.db, authConn.db, 'users');
  await copyCollection(sourceConn.db, authConn.db, 'auditlogs');
  console.log();

  // ── Migrate to db_election ───────────────────────────────
  console.log('📦 Migrating to db_election...');
  await copyCollection(sourceConn.db, electionConn.db, 'elections');
  await copyCollection(sourceConn.db, electionConn.db, 'parties');
  await copyCollection(sourceConn.db, electionConn.db, 'candidates');
  await copyCollection(sourceConn.db, electionConn.db, 'contactmessages');
  console.log();

  // ── Migrate to db_voting ─────────────────────────────────
  console.log('📦 Migrating to db_voting...');
  await copyCollection(sourceConn.db, votingConn.db, 'finalvotes');
  await copyCollection(sourceConn.db, votingConn.db, 'votes');
  await copyCollection(sourceConn.db, votingConn.db, 'votelogs');
  await copyCollection(sourceConn.db, votingConn.db, 'partyvotes');
  console.log();

  // ── Verify counts ────────────────────────────────────────
  console.log('=================================================');
  console.log(' Verification – Document counts after migration');
  console.log('=================================================');

  const collections = {
    'db_auth':     { conn: authConn,     cols: ['users', 'auditlogs'] },
    'db_election': { conn: electionConn, cols: ['elections', 'parties', 'candidates', 'contactmessages'] },
    'db_voting':   { conn: votingConn,   cols: ['finalvotes', 'votes', 'votelogs', 'partyvotes'] }
  };

  for (const [dbName, { conn, cols }] of Object.entries(collections)) {
    console.log(`\n  ${dbName}:`);
    for (const col of cols) {
      try {
        const count = await conn.db.collection(col).countDocuments();
        console.log(`    ${col}: ${count} documents`);
      } catch (err) {
        console.log(`    ${col}: error – ${err.message}`);
      }
    }
  }

  // ── Close all connections ────────────────────────────────
  await sourceConn.close();
  await authConn.close();
  await electionConn.close();
  await votingConn.close();

  console.log('\n=================================================');
  console.log(' ✅ Migration complete! Original data preserved.');
  console.log('    voting_system database was NOT modified.');
  console.log('=================================================\n');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
