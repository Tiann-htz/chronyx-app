const mysql = require('mysql2/promise');

// Create MySQL connection pool with explicit configuration
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'mysql-206107-0.cloudclusters.net',
  port: parseInt(process.env.MYSQL_PORT || '10063'),
  user: process.env.MYSQL_USER || 'admin',
  password: process.env.MYSQL_PASSWORD || 'wtNMtroY',
  database: process.env.MYSQL_DATABASE || 'chronyx',
  connectionLimit: 10,
  waitForConnections: true,
  connectTimeout: 60000,
  timezone: '+08:00'
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint } = req.query;

  try {
    // TEST ENDPOINT - Check if API is working with detailed env info
    if (endpoint === 'test' && req.method === 'GET') {
      const envInfo = {
        hasHost: !!process.env.MYSQL_HOST,
        hasPort: !!process.env.MYSQL_PORT,
        hasUser: !!process.env.MYSQL_USER,
        hasPassword: !!process.env.MYSQL_PASSWORD,
        hasDatabase: !!process.env.MYSQL_DATABASE,
        host: process.env.MYSQL_HOST || 'NOT SET - using fallback',
        port: process.env.MYSQL_PORT || 'NOT SET - using fallback',
        database: process.env.MYSQL_DATABASE || 'NOT SET - using fallback',
        user: process.env.MYSQL_USER || 'NOT SET - using fallback'
      };

      // Test database connection
      let dbStatus = 'Not tested';
      let connection;
      try {
        connection = await pool.getConnection();
        dbStatus = 'Connected successfully!';
        connection.release();
      } catch (dbError) {
        dbStatus = `Connection failed: ${dbError.message}`;
      }

      return res.status(200).json({
        success: true,
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        version: '3.0',
        envCheck: envInfo,
        databaseConnection: dbStatus
      });
    }

    // SIGNUP ENDPOINT - Create new employee
    if (endpoint === 'signup' && req.method === 'POST') {
      const { firstName, lastName, email, password } = req.body;

      console.log('=== SIGNUP REQUEST START ===');
      console.log('Email:', email);
      console.log('Pool config:', {
        host: pool.pool.config.connectionConfig.host,
        port: pool.pool.config.connectionConfig.port,
        database: pool.pool.config.connectionConfig.database
      });

      // Validate input
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }

      let connection;
      try {
        console.log('Attempting to get connection from pool...');
        connection = await pool.getConnection();
        console.log('✓ Connection obtained successfully');

        // Check if email already exists
        console.log('Checking for existing employee...');
        const [existingEmployees] = await connection.execute(
          'SELECT * FROM employee WHERE email = ?',
          [email]
        );
        console.log('Existing employees found:', existingEmployees.length);

        if (existingEmployees.length > 0) {
          connection.release();
          return res.status(400).json({
            success: false,
            message: 'Email already exists',
          });
        }

        // Insert new employee (removed user_type column)
        console.log('Inserting new employee...');
        const [result] = await connection.execute(
          'INSERT INTO employee (first_name, last_name, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
          [firstName, lastName, email, password]
        );

        connection.release();
        console.log('✓ Employee created successfully! ID:', result.insertId);
        console.log('=== SIGNUP REQUEST SUCCESS ===');

        return res.status(201).json({
          success: true,
          message: 'User created successfully',
          userId: result.insertId,
        });
      } catch (dbError) {
        if (connection) connection.release();
        console.error('!!! DATABASE ERROR !!!');
        console.error('Error code:', dbError.code);
        console.error('Error message:', dbError.message);
        console.error('Full error:', dbError);
        console.log('=== SIGNUP REQUEST FAILED ===');
        
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
          code: dbError.code
        });
      }
    }

    // LOGIN ENDPOINT - Authenticate employee
if (endpoint === 'login' && req.method === 'POST') {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Select all necessary fields including avatar_url
    const [employees] = await connection.execute(
      'SELECT employee_id, first_name, last_name, email, avatar_url FROM employee WHERE email = ? AND password = ?',
      [email, password]
    );

    connection.release();

    if (employees.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: employees[0].employee_id,
        firstName: employees[0].first_name,
        lastName: employees[0].last_name,
        email: employees[0].email,
        avatarUrl: employees[0].avatar_url,
      },
    });
  } catch (dbError) {
    if (connection) connection.release();
    console.error('Database error:', dbError);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: dbError.message,
    });
  }
}

    // CREATE QR CODE ENDPOINT
    if (endpoint === 'create-qr' && req.method === 'POST') {
      const { userId, firstName, lastName, email } = req.body;

      if (!userId || !firstName || !lastName || !email) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }

      let connection;
      try {
        connection = await pool.getConnection();

        // Check if employee already has a QR code
        const [existingQR] = await connection.execute(
          'SELECT * FROM employee_qr WHERE employee_id = ?',
          [userId]
        );

        if (existingQR.length > 0) {
          connection.release();
          return res.status(200).json({
            success: true,
            message: 'User already has a QR code',
            qrCode: existingQR[0].qr_code,
          });
        }

        // Generate unique QR code (format: QL-USERID-TIMESTAMP)
        const timestamp = Date.now();
        const qrCode = `QL-${userId}-${timestamp}`;

        // Insert QR code
        await connection.execute(
          'INSERT INTO employee_qr (employee_id, qr_code, first_name, last_name, email) VALUES (?, ?, ?, ?, ?)',
          [userId, qrCode, firstName, lastName, email]
        );

        connection.release();

        return res.status(201).json({
          success: true,
          message: 'QR code created successfully',
          qrCode: qrCode,
        });
      } catch (dbError) {
        if (connection) connection.release();
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
        });
      }
    }

    // CHECK QR CODE ENDPOINT
    if (endpoint === 'check-qr' && req.method === 'GET') {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      let connection;
      try {
        connection = await pool.getConnection();

        const [qrRecords] = await connection.execute(
          'SELECT qr_code, is_active, created_at FROM employee_qr WHERE employee_id = ?',
          [userId]
        );

        connection.release();

        if (qrRecords.length === 0) {
          return res.status(200).json({
            success: true,
            hasQR: false,
            qrCode: null,
          });
        }

        return res.status(200).json({
          success: true,
          hasQR: true,
          qrCode: qrRecords[0].qr_code,
          isActive: qrRecords[0].is_active,
          createdAt: qrRecords[0].created_at,
        });
        
      } catch (dbError) {
        if (connection) connection.release();
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
        });
      }
    }
   
    // GET ACCOUNT INFO ENDPOINT - Fetch created_at and updated_at
    if (endpoint === 'get-account-info' && req.method === 'GET') {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      let connection;
      try {
        connection = await pool.getConnection();

        const [employees] = await connection.execute(
          'SELECT created_at, updated_at FROM employee WHERE employee_id = ?',
          [userId]
        );

        connection.release();

        if (employees.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Employee not found',
          });
        }

        return res.status(200).json({
          success: true,
          createdAt: employees[0].created_at,
          updatedAt: employees[0].updated_at,
        });
      } catch (dbError) {
        if (connection) connection.release();
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
        });
      }
    }

    // GET USER PROFILE (including avatar)
    if (endpoint === 'get-profile' && req.method === 'GET') {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      let connection;
      try {
        connection = await pool.getConnection();

        const [employees] = await connection.execute(
          'SELECT employee_id, first_name, last_name, email, avatar_url, created_at, updated_at FROM employee WHERE employee_id = ?',
          [userId]
        );

        connection.release();

        if (employees.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Employee not found',
          });
        }

        return res.status(200).json({
          success: true,
          user: {
            id: employees[0].employee_id,
            firstName: employees[0].first_name,
            lastName: employees[0].last_name,
            email: employees[0].email,
            avatarUrl: employees[0].avatar_url,
            createdAt: employees[0].created_at,
            updatedAt: employees[0].updated_at,
          },
        });
      } catch (dbError) {
        if (connection) connection.release();
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
        });
      }
    }

    // UPDATE PROFILE ENDPOINT - Update employee details
    if (endpoint === 'update-profile' && req.method === 'POST') {
      const { userId, firstName, lastName, email } = req.body;

      console.log('=== UPDATE PROFILE REQUEST ===');
      console.log('User ID:', userId);

      if (!userId || !firstName || !lastName || !email) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }

      let connection;
      try {
        connection = await pool.getConnection();

        // Check if email is being changed and if it already exists
        const [existingEmail] = await connection.execute(
          'SELECT * FROM employee WHERE email = ? AND employee_id != ?',
          [email, userId]
        );

        if (existingEmail.length > 0) {
          connection.release();
          return res.status(400).json({
            success: false,
            message: 'Email already exists',
          });
        }

        // Update employee profile
        await connection.execute(
          'UPDATE employee SET first_name = ?, last_name = ?, email = ?, updated_at = NOW() WHERE employee_id = ?',
          [firstName, lastName, email, userId]
        );

        // Update employee_qr table if exists
        await connection.execute(
          'UPDATE employee_qr SET first_name = ?, last_name = ?, email = ? WHERE employee_id = ?',
          [firstName, lastName, email, userId]
        );

        connection.release();

        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          user: {
            id: userId,
            firstName,
            lastName,
            email,
          },
        });
      } catch (dbError) {
        if (connection) connection.release();
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
        });
      }
    }

    // UPDATE AVATAR ENDPOINT
    if (endpoint === 'update-avatar' && req.method === 'POST') {
      const { userId, avatarUrl } = req.body;

      console.log('=== UPDATE AVATAR REQUEST ===');
      console.log('User ID:', userId);

      if (!userId || !avatarUrl) {
        return res.status(400).json({
          success: false,
          message: 'User ID and avatar URL are required',
        });
      }

      let connection;
      try {
        connection = await pool.getConnection();

        // Update employee avatar
        await connection.execute(
          'UPDATE employee SET avatar_url = ?, updated_at = NOW() WHERE employee_id = ?',
          [avatarUrl, userId]
        );

        connection.release();

        console.log('✓ Avatar updated successfully for user ID:', userId);
        console.log('=== UPDATE AVATAR REQUEST SUCCESS ===');

        return res.status(200).json({
          success: true,
          message: 'Avatar updated successfully',
          avatarUrl: avatarUrl,
        });
      } catch (dbError) {
        if (connection) connection.release();
        console.error('Database error:', dbError);
        console.log('=== UPDATE AVATAR REQUEST FAILED ===');
        
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
        });
      }
    }

    // CHANGE PASSWORD ENDPOINT
    if (endpoint === 'change-password' && req.method === 'POST') {
      const { userId, currentPassword, newPassword } = req.body;

      console.log('=== CHANGE PASSWORD REQUEST ===');
      console.log('User ID:', userId);

      if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters',
        });
      }

      let connection;
      try {
        connection = await pool.getConnection();

        // Verify current password
        const [employees] = await connection.execute(
          'SELECT * FROM employee WHERE employee_id = ? AND password = ?',
          [userId, currentPassword]
        );

        if (employees.length === 0) {
          connection.release();
          return res.status(401).json({
            success: false,
            message: 'Current password is incorrect',
          });
        }

        // Update password
        await connection.execute(
          'UPDATE employee SET password = ?, updated_at = NOW() WHERE employee_id = ?',
          [newPassword, userId]
        );

        connection.release();

        return res.status(200).json({
          success: true,
          message: 'Password changed successfully',
        });
      } catch (dbError) {
        if (connection) connection.release();
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
        });
      }
    }

    // FORGOT PASSWORD ENDPOINT - Reset password with verification
    if (endpoint === 'forgot-password' && req.method === 'POST') {
      const { email, employeeId, firstName, lastName, newPassword } = req.body;

      console.log('=== FORGOT PASSWORD REQUEST ===');
      console.log('Email:', email);
      console.log('Employee ID:', employeeId);

      if (!email || !employeeId || !firstName || !lastName || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters',
        });
      }

      let connection;
      try {
        connection = await pool.getConnection();

        // Verify employee credentials (email, employee_id, first_name, last_name)
        const [employees] = await connection.execute(
          'SELECT * FROM employee WHERE employee_id = ? AND email = ? AND first_name = ? AND last_name = ?',
          [employeeId, email, firstName, lastName]
        );

        if (employees.length === 0) {
          connection.release();
          return res.status(401).json({
            success: false,
            message: 'Invalid credentials. Please check your Employee ID, First Name, and Last Name.',
          });
        }

        // Update password
        await connection.execute(
          'UPDATE employee SET password = ?, updated_at = NOW() WHERE employee_id = ?',
          [newPassword, employeeId]
        );

        connection.release();

        console.log('✓ Password reset successfully for employee ID:', employeeId);
        console.log('=== FORGOT PASSWORD REQUEST SUCCESS ===');

        return res.status(200).json({
          success: true,
          message: 'Password reset successfully',
        });
      } catch (dbError) {
        if (connection) connection.release();
        console.error('Database error:', dbError);
        console.log('=== FORGOT PASSWORD REQUEST FAILED ===');
        
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
        });
      }
    }


    // GET TODAY'S ATTENDANCE ENDPOINT
    if (endpoint === 'get-today-attendance' && req.method === 'GET') {
      const { employeeId } = req.query;

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is required',
        });
      }

      let connection;
      try {
        connection = await pool.getConnection();

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Get time-in record for today
        const [timeInRecords] = await connection.execute(
          `SELECT * FROM attendance 
           WHERE employee_id = ? AND date = ? AND action_type = 'time-in' 
           ORDER BY timestamp DESC LIMIT 1`,
          [employeeId, today]
        );

        // Get time-out record for today
        const [timeOutRecords] = await connection.execute(
          `SELECT * FROM attendance 
           WHERE employee_id = ? AND date = ? AND action_type = 'time-out' 
           ORDER BY timestamp DESC LIMIT 1`,
          [employeeId, today]
        );

        connection.release();

        if (timeInRecords.length === 0) {
          return res.status(200).json({
            success: true,
            data: null,
            message: 'No attendance record for today',
          });
        }

        const timeIn = timeInRecords[0];
        const timeOut = timeOutRecords.length > 0 ? timeOutRecords[0] : null;

        return res.status(200).json({
          success: true,
          data: {
            timeIn: timeIn.time,
            timeOut: timeOut ? timeOut.time : null,
            status: timeOut ? timeOut.status : timeIn.status,
            late_minutes: timeOut ? timeOut.late_minutes : timeIn.late_minutes,
            overtime_minutes: timeOut ? timeOut.overtime_minutes : 0,
            undertime_minutes: timeOut ? timeOut.undertime_minutes : 0,
          },
        });
      } catch (dbError) {
        if (connection) connection.release();
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
        });
      }
    }

    // GET TIME POLICY ENDPOINT
    if (endpoint === 'get-time-policy' && req.method === 'GET') {
      let connection;
      try {
        connection = await pool.getConnection();

        const [policies] = await connection.execute(
          'SELECT * FROM time_policy ORDER BY policy_id DESC LIMIT 1'
        );

        connection.release();

        if (policies.length === 0) {
          return res.status(200).json({
            success: true,
            data: null,
            message: 'No time policy set',
          });
        }

        return res.status(200).json({
          success: true,
          data: policies[0],
        });
      } catch (dbError) {
        if (connection) connection.release();
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
        });
      }
    }

    // GET MONTHLY STATS ENDPOINT
    if (endpoint === 'get-monthly-stats' && req.method === 'GET') {
      const { employeeId, month, year } = req.query;

      if (!employeeId || !month || !year) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID, month, and year are required',
        });
      }

      let connection;
      try {
        connection = await pool.getConnection();

        // Count distinct days with time-in records for the month
        const [stats] = await connection.execute(
          `SELECT COUNT(DISTINCT date) as totalDays
           FROM attendance 
           WHERE employee_id = ? 
           AND MONTH(date) = ? 
           AND YEAR(date) = ?
           AND action_type = 'time-in'`,
          [employeeId, month, year]
        );

        connection.release();

        return res.status(200).json({
          success: true,
          data: {
            totalDays: stats[0]?.totalDays || 0,
          },
        });
      } catch (dbError) {
        if (connection) connection.release();
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
        });
      }
    }

     // GET ATTENDANCE HISTORY ENDPOINT
    if (endpoint === 'get-attendance-history' && req.method === 'GET') {
      const { employeeId, month, year, status } = req.query;

      if (!employeeId || !month || !year) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID, month, and year are required',
        });
      }

      let connection;
      try {
        connection = await pool.getConnection();

        // Build query with optional status filter
        let query = `SELECT * FROM attendance 
           WHERE employee_id = ? 
           AND MONTH(date) = ? 
           AND YEAR(date) = ?`;
        
        const params = [employeeId, month, year];

        // Add status filter if provided and not 'all'
        if (status && status !== 'all') {
          query += ` AND status = ?`;
          params.push(status);
        }

        query += ` ORDER BY date DESC, timestamp DESC`;

        // Get all attendance records for the specified month
        const [records] = await connection.execute(query, params);

        connection.release();

        return res.status(200).json({
          success: true,
          data: records,
        });
      } catch (dbError) {
        if (connection) connection.release();
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
        });
      }
    }

    // GET MONTHLY SUMMARY ENDPOINT
    if (endpoint === 'get-monthly-summary' && req.method === 'GET') {
      const { employeeId, month, year } = req.query;

      if (!employeeId || !month || !year) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID, month, and year are required',
        });
      }

      let connection;
      try {
        connection = await pool.getConnection();

        // Count distinct days with time-in records
        const [daysPresent] = await connection.execute(
          `SELECT COUNT(DISTINCT date) as totalDaysPresent
           FROM attendance 
           WHERE employee_id = ? 
           AND MONTH(date) = ? 
           AND YEAR(date) = ?
           AND action_type = 'time-in'`,
          [employeeId, month, year]
        );

        // Calculate total hours (sum of completed days only)
        const [hoursData] = await connection.execute(
          `SELECT 
             SUM(
               CASE 
                 WHEN tout.time IS NOT NULL 
                 THEN TIMESTAMPDIFF(MINUTE, 
                   CONCAT(tin.date, ' ', tin.time), 
                   CONCAT(tout.date, ' ', tout.time)
                 ) / 60.0
                 ELSE 0
               END
             ) as totalMinutes
           FROM attendance tin
           LEFT JOIN (
             SELECT employee_id, date, time, action_type
             FROM attendance
             WHERE action_type = 'time-out'
           ) tout ON tin.employee_id = tout.employee_id 
             AND tin.date = tout.date
           WHERE tin.employee_id = ?
           AND MONTH(tin.date) = ?
           AND YEAR(tin.date) = ?
           AND tin.action_type = 'time-in'`,
          [employeeId, month, year]
        );

        // Count late instances
        const [lateCount] = await connection.execute(
          `SELECT COUNT(*) as totalLate
           FROM attendance 
           WHERE employee_id = ? 
           AND MONTH(date) = ? 
           AND YEAR(date) = ?
           AND action_type = 'time-in'
           AND late_minutes > 0`,
          [employeeId, month, year]
        );

        // Sum overtime minutes
        const [overtimeData] = await connection.execute(
          `SELECT SUM(overtime_minutes) as totalOvertimeMinutes
           FROM attendance 
           WHERE employee_id = ? 
           AND MONTH(date) = ? 
           AND YEAR(date) = ?
           AND action_type = 'time-out'
           AND overtime_minutes > 0`,
          [employeeId, month, year]
        );

        connection.release();

        const totalHours = hoursData[0]?.totalMinutes 
          ? parseFloat(hoursData[0].totalMinutes).toFixed(2)
          : '0.00';

        const totalOvertimeMinutes = overtimeData[0]?.totalOvertimeMinutes || 0;

        return res.status(200).json({
          success: true,
          data: {
            totalDaysPresent: daysPresent[0]?.totalDaysPresent || 0,
            totalHours: totalHours,
            totalLate: lateCount[0]?.totalLate || 0,
            totalOvertime: totalOvertimeMinutes,
          },
        });
      } catch (dbError) {
        if (connection) connection.release();
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
        });
      }
    }


    // GET CURRENT SALARY PERIOD ENDPOINT
    if (endpoint === 'get-current-salary' && req.method === 'GET') {
      const { employeeId } = req.query;

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is required',
        });
      }

      let connection;
      try {
        connection = await pool.getConnection();

        // Get the most recent payroll record
        const [records] = await connection.execute(
          `SELECT * FROM payroll 
           WHERE employee_id = ? 
           ORDER BY created_at DESC 
           LIMIT 1`,
          [employeeId]
        );

        connection.release();

        if (records.length === 0) {
          return res.status(200).json({
            success: true,
            data: null,
            message: 'No current salary period found',
          });
        }

        return res.status(200).json({
          success: true,
          data: records[0],
        });
      } catch (dbError) {
        if (connection) connection.release();
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
        });
      }
    }

    // GET SALARY HISTORY ENDPOINT
    if (endpoint === 'get-salary-history' && req.method === 'GET') {
      const { employeeId } = req.query;

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is required',
        });
      }

      let connection;
      try {
        connection = await pool.getConnection();

        // Get all payroll records, excluding the most recent one (shown as current)
        const [records] = await connection.execute(
          `SELECT * FROM payroll 
           WHERE employee_id = ? 
           ORDER BY period_end DESC, created_at DESC
           LIMIT 50`,
          [employeeId]
        );

        connection.release();

        // Remove the first record if it exists (it's the current period)
        const historyRecords = records.length > 1 ? records.slice(1) : [];

        return res.status(200).json({
          success: true,
          data: historyRecords,
        });
      } catch (dbError) {
        if (connection) connection.release();
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
        });
      }
    }

    // GET NOTIFICATIONS ENDPOINT (QR Deactivation Notices)
    if (endpoint === 'get-notifications' && req.method === 'GET') {
      const { employeeId } = req.query;

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is required',
        });
      }

      let connection;
      try {
        connection = await pool.getConnection();

        // Get deactivated QR codes with admin name
        const [records] = await connection.execute(
          `SELECT eq.*, a.admin_name 
           FROM employee_qr eq
           LEFT JOIN admin a ON eq.deactivated_by = a.admin_id
           WHERE eq.employee_id = ? 
           AND eq.is_active = 0
           ORDER BY eq.deactivated_at DESC`,
          [employeeId]
        );

        // Count unread notifications
        const [unreadCount] = await connection.execute(
          `SELECT COUNT(*) as unread_count FROM employee_qr 
           WHERE employee_id = ? 
           AND is_active = 0 
           AND is_read = 0`,
          [employeeId]
        );

        connection.release();

        return res.status(200).json({
          success: true,
          data: records,
          unreadCount: unreadCount[0]?.unread_count || 0,
        });
      } catch (dbError) {
        if (connection) connection.release();
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
        });
      }
    }

    // MARK NOTIFICATION AS READ ENDPOINT
    if (endpoint === 'mark-notification-read' && req.method === 'POST') {
      const { qrId } = req.body;

      if (!qrId) {
        return res.status(400).json({
          success: false,
          message: 'QR ID is required',
        });
      }

      let connection;
      try {
        connection = await pool.getConnection();

        // Update is_read to 1 (read)
        await connection.execute(
          `UPDATE employee_qr SET is_read = 1 WHERE qr_id = ?`,
          [qrId]
        );

        connection.release();

        return res.status(200).json({
          success: true,
          message: 'Notification marked as read',
        });
      } catch (dbError) {
        if (connection) connection.release();
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: dbError.message,
        });
      }
    }

    // If no endpoint matches
    return res.status(404).json({
      success: false,
      message: 'Endpoint not found',
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};