const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER || 'DESKTOP-QVV1OE5\\MSSQLSERVER01',
  database: process.env.DB_NAME || 'PPMS_BajajPant',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL using Windows Authentication');
    return pool;
  })
  .catch(err => {
    console.warn('MSSQL connection unavailable. Server running in offline simulation mode:', err.message || err);
    return null;
  });

module.exports = {
  sql, poolPromise
};
