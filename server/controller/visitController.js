const Visit = require("../models/visit");
const moment = require('moment-timezone');
const { createVisitEvents, updateVisitEvents, deleteVisitEvents } = require("../services/calendarService");

exports.createVisit = async (req, res) => {
  try {
    const dateFromUtc = req.body.dateFrom ? moment.tz(req.body.dateFrom, "Asia/Beirut").toDate() : null;
    const dateToUtc = req.body.dateTo ? moment.tz(req.body.dateTo, "Asia/Beirut").toDate() : null;

    const visitData = {
      userId: req.user._id,
      name: req.body.name,
      hotel: req.body.hotel,
      car: req.body.car,
      type: req.body.type,
      category: req.body.category,
      dateFrom: dateFromUtc,
      dateTo: dateToUtc,
      pricePerDay: req.body.pricePerDay,
      totalDays: req.body.totalDays,
      arrivalPrice: req.body.arrivalPrice,
      departurePrice: req.body.departurePrice,
      fullPricePackages: req.body.fullPricePackages,
    };

    const newVisit = Visit.build(visitData);

    const totalCost = newVisit.fullPricePackages
      ? newVisit.fullPricePackages
      : newVisit.calculateTotalCost();

    newVisit.totalCost = totalCost;

    let arrivalEventLink = null;
    let departureEventLink = null;

    try {
      const eventIds = await createVisitEvents(newVisit);
      newVisit.arrivalEventId = eventIds.arrivalEventId || null;
      newVisit.departureEventId = eventIds.departureEventId || null;
      arrivalEventLink = eventIds.arrivalEventLink || null;
      departureEventLink = eventIds.departureEventLink || null;
    } catch (calendarError) {
      console.error("Calendar sync failed on create:", calendarError.message);
    }

    const savedVisit = await newVisit.save();

    res.status(201).json({
      ...savedVisit.toJSON(),
      arrivalEventLink,
      departureEventLink,
    });
  } catch (error) {
    console.error("Error creating visit:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getVisitById = async (req, res) => {
  try {
    const visit = await Visit.findByPk(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }
    res.status(200).json(visit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllVisits = async (req, res) => {
  try {
    const visits = await Visit.findAll({
      where: { userId: req.user._id },
      order: [['createdAt', 'DESC']],
    });
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const id = req.params.id;
    const visit = await Visit.findOne({ where: { id, userId: req.user._id } });
    if (!visit) {
      return res.status(404).json({ msg: "Visit not found or unauthorized" });
    }

    visit.isPaid = !visit.isPaid;
    await visit.save();

    res.json({ msg: `Visit marked as ${visit.isPaid ? "paid" : "unpaid"}`, visit });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getPaymentSummary = async (req, res) => {
  try {
    const visits = await Visit.findAll({ where: { userId: req.user._id } });

    const calculateVisitTotal = (v) => {
      let total = 0;
      if (v.pricePerDay && v.totalDays) total += v.pricePerDay * v.totalDays;
      if (v.arrivalPrice) total += v.arrivalPrice;
      if (v.departurePrice) total += v.departurePrice;
      return total;
    };

    const totalAmount = visits.reduce((sum, v) => sum + calculateVisitTotal(v), 0);
    const totalPaid = visits
      .filter((v) => v.isPaid)
      .reduce((sum, v) => sum + calculateVisitTotal(v), 0);
    const remainingAmount = totalAmount - totalPaid;

    res.json({
      totalAmount,
      totalPaid,
      remainingAmount,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.editVisit = async (req, res) => {
  try {
    const visitId = req.params.id;
    const updateFields = { ...req.body };

    delete updateFields.id;
    delete updateFields._id;
    delete updateFields.userId;
    delete updateFields.createdAt;
    delete updateFields.totalCost;
    delete updateFields.arrivalEventId;
    delete updateFields.departureEventId;

    if ('dateFrom' in updateFields) {
      updateFields.dateFrom = updateFields.dateFrom
        ? moment.tz(updateFields.dateFrom, "Asia/Beirut").toDate()
        : null;
    }
    if ('dateTo' in updateFields) {
      updateFields.dateTo = updateFields.dateTo
        ? moment.tz(updateFields.dateTo, "Asia/Beirut").toDate()
        : null;
    }

    delete updateFields.arrivalReminderSent;
    delete updateFields.departureReminderSent;

    const numericFields = ['pricePerDay', 'totalDays', 'arrivalPrice', 'departurePrice', 'fullPricePackages'];
    for (const field of numericFields) {
      if (field in updateFields) {
        updateFields[field] =
          updateFields[field] === '' || updateFields[field] === null || updateFields[field] === undefined
            ? null
            : Number(updateFields[field]);
      }
    }

    const existingVisit = await Visit.findOne({ where: { id: visitId, userId: req.user._id } });
    if (!existingVisit) {
      return res.status(404).json({ message: "Visit not found or unauthorized" });
    }

    const dateFromChanged =
      'dateFrom' in updateFields &&
      existingVisit.dateFrom?.getTime() !== updateFields.dateFrom?.getTime();
    const dateToChanged =
      'dateTo' in updateFields &&
      existingVisit.dateTo?.getTime() !== updateFields.dateTo?.getTime();

    Object.assign(existingVisit, updateFields);

    if (dateFromChanged) existingVisit.arrivalReminderSent = false;
    if (dateToChanged) existingVisit.departureReminderSent = false;

    existingVisit.totalCost = existingVisit.fullPricePackages
      ? existingVisit.fullPricePackages
      : existingVisit.calculateTotalCost();

    try {
      const eventIds = await updateVisitEvents(existingVisit);
      existingVisit.arrivalEventId = eventIds.arrivalEventId;
      existingVisit.departureEventId = eventIds.departureEventId;
    } catch (calendarError) {
      console.error("Calendar sync failed on edit:", calendarError.message);
    }

    const savedVisit = await existingVisit.save();

    res.json(savedVisit);
  } catch (error) {
    console.error("Error editing visit:", error.name, error.message, error.errors);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

exports.deleteVisit = async (req, res) => {
  try {
    const visitId = req.params.id;
    const visit = await Visit.findOne({ where: { id: visitId, userId: req.user._id } });
    if (!visit) {
      return res.status(404).json({ message: "Visit not found or unauthorized" });
    }

    try {
      await deleteVisitEvents(visit);
    } catch (calendarError) {
      console.error("Calendar sync failed on delete:", calendarError.message);
    }

    await visit.destroy();
    res.json({ message: "Visit deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};