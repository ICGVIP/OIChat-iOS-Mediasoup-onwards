/**
 * Example: Add "group call" logging endpoints to your existing backend (Express + Sequelize).
 *
 * Context (your current backend):
 *   router.post('/create_call', passport.authenticate('jwt',{session:false}), CallController.createCall)
 *   router.get('/end_call/:id', passport.authenticate('jwt',{session:false}), CallController.endCall)
 *   router.get('/get_calls', passport.authenticate('jwt',{session:false}), CallController.fetchCalls)
 *
 * Your existing models support many-to-many via CallUsers, so a "group call"
 * can be represented as the same Call row, simply associated with >2 users.
 *
 * This file shows:
 *   1) router additions: /create_group_call and /get_group_calls
 *   2) controller methods: createGroupCall and fetchGroupCalls
 *
 * Notes:
 * - No DB migration required: we infer "group" when call has >= 3 users.
 * - We use a transaction so Call + CallUsers associations are consistent.
 */

// -------------------------
// routes/calls.js (snippet)
// -------------------------
//
// const express = require('express');
// const passport = require('passport');
// const CallController = require('../controllers/CallController');
// const router = express.Router();
//
// router.post('/create_call', passport.authenticate('jwt', { session: false }), CallController.createCall);
// router.post('/create_group_call', passport.authenticate('jwt', { session: false }), CallController.createGroupCall);
//
// router.get('/end_call/:id', passport.authenticate('jwt', { session: false }), CallController.endCall);
//
// router.get('/get_calls', passport.authenticate('jwt', { session: false }), CallController.fetchCalls);
// router.get('/get_group_calls', passport.authenticate('jwt', { session: false }), CallController.fetchGroupCalls);
//
// module.exports = router;

// --------------------------------
// controllers/CallController.js
// --------------------------------

const User = require('../models/User');
const Call = require('../models/Calls/Call');
const sequelize = require('../config/sequelize');

/**
 * POST /create_group_call
 * body: { to: number[]; type: 'audio' | 'video' }
 *
 * Creates a Call and associates:
 * - caller (req.user.id)
 * - all recipients in `to[]`
 *
 * Returns: { success: true, id: callId, participantIds: [...] }
 */
module.exports.createGroupCall = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const callerId = req.user.id;
    const { to, type } = req.body;

    const toIdsRaw = Array.isArray(to) ? to : [];
    const toIds = [...new Set(toIdsRaw.map((x) => parseInt(x, 10)).filter(Boolean))];

    if (toIds.length < 2) {
      // group means: caller + at least 2 others (3 participants total)
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Group call requires at least 2 recipients',
      });
    }

    // Fetch users (validate existence)
    const caller = await User.findByPk(callerId, { transaction: t });
    if (!caller) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Caller not found' });
    }

    const recipients = await User.findAll({
      where: { id: toIds },
      transaction: t,
    });

    if (!recipients || recipients.length !== toIds.length) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'One or more recipients not found',
      });
    }

    const call = await Call.create(
      {
        type,
        startedBy: callerId,
        // Optional (requires DB migration):
        // kind: 'group',
        // participantCount: toIds.length + 1,
      },
      { transaction: t }
    );

    // Associate caller + recipients
    await call.addUsers([caller, ...recipients], { transaction: t });

    await t.commit();

    // Structured log (you can replace with Winston/Pino/etc.)
    console.log('📞 [API] create_group_call', {
      callId: call.dataValues.id,
      type,
      startedBy: callerId,
      to: toIds,
      participantCount: toIds.length + 1,
      at: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      id: call.dataValues.id,
      participantIds: [callerId, ...toIds],
    });
  } catch (err) {
    try { await t.rollback(); } catch (e) {}
    console.log('**Error in creating group call', err);
    return res.status(500).json({
      success: false,
      message: 'Some error in creating group call',
    });
  }
};

/**
 * GET /get_group_calls
 *
 * Same as fetchCalls, but filters to calls that have >= 3 users.
 * This is "logging/reporting": it lets you fetch only group calls for the logged-in user.
 */
module.exports.fetchGroupCalls = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Pull all calls, then filter by number of users.
    // If your table gets large, optimize with a SQL aggregate/group query.
    const calls = await user.getCalls({ order: [['createdAt', 'DESC']] });

    const reply = [];
    for (const call of calls) {
      const users = await call.getUsers({
        raw: true,
        attributes: ['id', 'avatar'],
      });
      const isGroup = Array.isArray(users) && users.length >= 3;
      if (!isGroup) continue;

      call.dataValues.otherUsers = users.filter((u) => u.id !== userId);
      delete call.CallUsers;
      reply.push(call.dataValues);
    }

    console.log('📞 [API] get_group_calls', {
      userId,
      count: reply.length,
      at: new Date().toISOString(),
    });

    return res.status(200).json({ success: true, data: reply });
  } catch (err) {
    console.log('**Error fetching group calls', err);
    return res.status(500).json({
      success: false,
      message: 'Some error fetching group calls',
    });
  }
};

/**
 * OPTIONAL: If you want stronger analytics later, add fields to Call model (DB migration needed):
 *   - kind: ENUM('direct','group')
 *   - participantCount: INTEGER
 *   - startedAt: DATE (or use createdAt)
 *   - endedReason: STRING ('hangup','timeout','network','error', etc.)
 *
 * Then create a "/log_call_event" endpoint with a CallEvents table for:
 *   - callId, userId, event, at, metadata(JSON)
 */


