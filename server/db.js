const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const serverName = process.env.DB_SERVER || 'localhost';
const databaseName = process.env.DB_NAME || 'PPMS_BajajPant';
const isSqlAuth = Boolean(process.env.DB_USER && process.env.DB_PASSWORD);

const connString = isSqlAuth
  ? `server=${serverName};Database=${databaseName};Uid=${process.env.DB_USER};Pwd=${process.env.DB_PASSWORD};Driver={SQL Server Native Client 11.0};TrustServerCertificate=Yes;`
  : `server=${serverName};Database=${databaseName};Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0};TrustServerCertificate=Yes;`;

const config = {
  connectionString: connString,
  driver: 'msnodesqlv8'
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log(`[MSSQL] CONNECTED SUCCESSFULLY to ${databaseName} on ${serverName} (${isSqlAuth ? 'SQL Auth' : 'Windows Auth'})`);
    return pool;
  })
  .catch(err => {
    console.warn(`[MSSQL] Database connection fallback: ${err.message}`);
    return null;
  });

module.exports = {
  sql, poolPromise
};
