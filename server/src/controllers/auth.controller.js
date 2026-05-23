import Customer from "../models/customer.model.js";
import User from "../models/user.model.js";
import { generateRsaKeys } from "../helpers/crypto.helper.js";
import { hashPassword, isPasswordHashed, verifyPassword } from "../helpers/password.helper.js";

function publicCustomer(customer) {
  if (!customer) return null;
  return {
    customerId: customer.customerId,
    fullName: customer.fullName,
    address: customer.address,
    birthDate: customer.birthDate,
    username: customer.username,
    email: customer.email,
    accountStatus: customer.accountStatus
  };
}

export async function login(req, res) {
  const username = req.body.username || req.body.userName;
  const { password } = req.body;

  const admin = await User.findOne({
    username,
    role: "admin",
    status: 1
  });

  if (admin && await verifyPassword(password, admin.password)) {
    if (!isPasswordHashed(admin.password)) {
      admin.password = await hashPassword(password);
      await admin.save();
    }

    res.json({
      role: admin.role,
      user: {
        userId: admin._id.toString(),
        fullName: admin.fullName || admin.username,
        username: admin.username
      }
    });
    return;
  }

  const user = await Customer.findOne({
    username,
    accountStatus: 1
  });

  if (!user || !(await verifyPassword(password, user.password))) {
    res.status(401).json({ message: "Invalid username or password" });
    return;
  }

  if (!isPasswordHashed(user.password)) {
    user.password = await hashPassword(password);
    await user.save();
  }

  res.json({ role: "customer", user: publicCustomer(user.toObject()) });
}

export async function register(req, res) {
  const username = req.body.username || req.body.userName;
  const {
    password,
    confirmPassword,
    email,
    fullName,
    phoneNumber,
    address,
    birthDate
  } = req.body;

  if (!username || !password || !phoneNumber) {
    res.status(400).json({ message: "Missing username, password, or phone number" });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ message: "Password confirmation does not match" });
    return;
  }

  const existing = await Customer.findOne({
    $or: [{ customerId: phoneNumber }, { username }]
  }).lean();

  if (existing) {
    res.status(409).json({ message: "Phone number or username already exists" });
    return;
  }

  const { publicKey, privateKey } = generateRsaKeys();
  await Customer.create({
    customerId: phoneNumber,
    fullName: fullName || "",
    address: address || "",
    birthDate: birthDate || null,
    username,
    password: await hashPassword(password),
    email: email || "",
    accountStatus: 1,
    privateKey,
    publicKey
  });

  res.status(201).json({ message: "Register successfully" });
}

export async function getCustomer(req, res) {
  const customer = await Customer.findOne({ customerId: req.params.id }).lean();
  if (!customer) {
    res.status(404).json({ message: "Customer not found" });
    return;
  }

  res.json(publicCustomer(customer));
}

export async function updateCustomer(req, res) {
  const username = req.body.username || req.body.userName;
  const {
    fullName,
    address,
    birthDate,
    oldPassword,
    newPassword,
    email
  } = req.body;

  const customer = await Customer.findOne({ customerId: req.params.id });

  if (!customer || !(await verifyPassword(oldPassword, customer.password))) {
    res.status(401).json({ message: "Old password is incorrect" });
    return;
  }

  customer.fullName = fullName;
  customer.address = address;
  customer.birthDate = birthDate || null;
  customer.username = username;
  customer.password = await hashPassword(newPassword);
  customer.email = email;
  await customer.save();

  res.json({ message: "Customer updated" });
}
