import User from "../models/user.model.js";
import { hashPassword, isPasswordHashed } from "./password.helper.js";

export async function seedDefaultAdmin() {
  const existingAdmin = await User.findOne({ username: "admin", role: "admin" });
  if (existingAdmin) {
    if (!isPasswordHashed(existingAdmin.password)) {
      existingAdmin.password = await hashPassword(existingAdmin.password);
      await existingAdmin.save();
      console.log("Upgraded default admin password to bcrypt hash");
    }
    return;
  }

  await User.create({
    username: "admin",
    password: await hashPassword("admin"),
    fullName: "Admin",
    role: "admin",
    status: 1
  });

  console.log("Seeded default admin user: admin/admin");
}
