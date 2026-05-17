/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           LEGACY BACKEND — DECOMMISSIONED                   ║
 * ║                                                              ║
 * ║  This monolithic backend has been fully replaced by the      ║
 * ║  distributed microservices architecture:                     ║
 * ║                                                              ║
 * ║   auth-service/     → port 5001  (users, auth, audit)       ║
 * ║   election-service/ → port 5002  (elections, parties)       ║
 * ║   voting-service/   → port 5003  (votes, results)           ║
 * ║   gateway/          → port 5000  (API Gateway)              ║
 * ║                                                              ║
 * ║  All routes, logic, and data have been migrated.             ║
 * ║  DO NOT start this file — it will conflict with the gateway  ║
 * ║  on port 5000.                                               ║
 * ║                                                              ║
 * ║  To run the system: use start-all.bat or start each          ║
 * ║  service individually with npm start.                        ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║           LEGACY BACKEND — DECOMMISSIONED                   ║');
console.log('║                                                              ║');
console.log('║  This backend has been replaced by distributed services.    ║');
console.log('║  Please start the system using start-all.bat instead.       ║');
console.log('║                                                              ║');
console.log('║   gateway/          → port 5000  (API Gateway)              ║');
console.log('║   auth-service/     → port 5001  (users, auth, audit)       ║');
console.log('║   election-service/ → port 5002  (elections, parties)       ║');
console.log('║   voting-service/   → port 5003  (votes, results)           ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');
process.exit(0);
