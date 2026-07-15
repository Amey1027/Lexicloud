import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "lexicloud.sqlite");

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    document_type TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS document_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_document_history_user ON document_history(user_id);
`);

// Seed templates once, the same starter templates the old Supabase migration shipped with.
const templateCount = db.prepare("SELECT COUNT(*) as count FROM templates").get().count;

if (templateCount === 0) {
  const insert = db.prepare(`
    INSERT INTO templates (id, name, category, document_type, description, content)
    VALUES (@id, @name, @category, @document_type, @description, @content)
  `);

  const templates = [
    {
      name: "Standard NDA",
      category: "Confidentiality",
      document_type: "Non-Disclosure Agreement",
      description: "Basic mutual non-disclosure agreement for protecting confidential information",
      content: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement (the "Agreement") is entered into as of [DATE] by and between:

Party A: [PARTY A NAME]
Party B: [PARTY B NAME]

WHEREAS, the parties wish to explore a business opportunity of mutual interest and in connection with this opportunity, each party may disclose to the other certain confidential technical and business information that the disclosing party desires the receiving party to treat as confidential.

NOW, THEREFORE, the parties agree as follows:

1. CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by either party to the other party, either directly or indirectly, in writing, orally or by inspection of tangible objects.

2. NON-DISCLOSURE AND NON-USE OBLIGATIONS
Each party agrees not to disclose Confidential Information obtained from the other party to third parties or to use such Confidential Information for any purpose except to evaluate and pursue the business opportunity.

3. TERM
This Agreement shall remain in effect for a period of [DURATION] from the date of execution.

4. GOVERNING LAW
This Agreement shall be governed by the laws of India.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_________________________          _________________________
Party A Signature                  Party B Signature

Date: ______________              Date: ______________`,
    },
    {
      name: "Employment Agreement",
      category: "Employment",
      document_type: "Employment Contract",
      description: "Standard employment contract template for Indian companies",
      content: `EMPLOYMENT AGREEMENT

This Employment Agreement (the "Agreement") is entered into on [DATE] between:

Employer: [COMPANY NAME]
Address: [COMPANY ADDRESS]

Employee: [EMPLOYEE NAME]
Address: [EMPLOYEE ADDRESS]

1. POSITION AND DUTIES
The Employee is hired for the position of [JOB TITLE] and shall perform duties as assigned by the Employer.

2. COMPENSATION
The Employee shall receive a salary of INR [AMOUNT] per [MONTH/YEAR], payable in accordance with the Employer's standard payroll schedule.

3. WORKING HOURS
The Employee shall work [NUMBER] hours per week, with specific hours to be determined by the Employer.

4. LEAVE AND BENEFITS
The Employee shall be entitled to leave and benefits as per company policy and applicable Indian labor laws.

5. TERMINATION
Either party may terminate this Agreement with [NOTICE PERIOD] notice in writing.

6. CONFIDENTIALITY
The Employee agrees to maintain confidentiality of all proprietary information of the Employer.

7. GOVERNING LAW
This Agreement shall be governed by the laws of India.

IN WITNESS WHEREOF, the parties have executed this Agreement:

_________________________          _________________________
Employer Signature                 Employee Signature

Date: ______________              Date: ______________`,
    },
    {
      name: "Service Agreement",
      category: "Business",
      document_type: "Service Agreement",
      description: "Professional services agreement template",
      content: `SERVICE AGREEMENT

This Service Agreement (the "Agreement") is entered into on [DATE] between:

Service Provider: [PROVIDER NAME]
Address: [PROVIDER ADDRESS]

Client: [CLIENT NAME]
Address: [CLIENT ADDRESS]

1. SERVICES
The Service Provider agrees to provide the following services: [DESCRIPTION OF SERVICES]

2. TERM
This Agreement shall commence on [START DATE] and continue until [END DATE] or until terminated as provided herein.

3. COMPENSATION
The Client agrees to pay the Service Provider INR [AMOUNT] for the services, payable as follows: [PAYMENT TERMS]

4. DELIVERABLES
The Service Provider shall deliver: [LIST DELIVERABLES]

5. INTELLECTUAL PROPERTY
All intellectual property rights in deliverables shall vest in [PARTY NAME] upon full payment.

6. TERMINATION
Either party may terminate this Agreement with [NOTICE PERIOD] written notice.

7. GOVERNING LAW
This Agreement shall be governed by the laws of India.

IN WITNESS WHEREOF, the parties have executed this Agreement:

_________________________          _________________________
Service Provider Signature         Client Signature

Date: ______________              Date: ______________`,
    },
    {
      name: "Rental Agreement",
      category: "Property",
      document_type: "Lease Agreement",
      description: "Residential rental/lease agreement template",
      content: `RENTAL AGREEMENT

This Rental Agreement is made on [DATE] between:

Landlord: [LANDLORD NAME]
Address: [LANDLORD ADDRESS]

Tenant: [TENANT NAME]
Address: [TENANT ADDRESS]

1. PROPERTY
The Landlord agrees to rent to the Tenant the property located at: [PROPERTY ADDRESS]

2. TERM
The term of this Agreement shall be for [DURATION] commencing from [START DATE].

3. RENT
The monthly rent shall be INR [AMOUNT], payable on or before the [DAY] of each month.

4. SECURITY DEPOSIT
The Tenant shall pay a security deposit of INR [AMOUNT], refundable upon termination subject to property condition.

5. MAINTENANCE
The Tenant shall maintain the property in good condition and shall be responsible for [MAINTENANCE TERMS].

6. TERMINATION
This Agreement may be terminated by either party with [NOTICE PERIOD] written notice.

7. GOVERNING LAW
This Agreement shall be governed by the laws of India.

IN WITNESS WHEREOF, the parties have executed this Agreement:

_________________________          _________________________
Landlord Signature                 Tenant Signature

Date: ______________              Date: ______________`,
    },
    {
      name: "Partnership Deed",
      category: "Business",
      document_type: "Partnership Agreement",
      description: "Partnership deed for Indian partnership firms",
      content: `PARTNERSHIP DEED

This Partnership Deed is made on [DATE] between:

Partner 1: [PARTNER 1 NAME]
Address: [PARTNER 1 ADDRESS]

Partner 2: [PARTNER 2 NAME]
Address: [PARTNER 2 ADDRESS]

1. NAME AND BUSINESS
The partners agree to carry on business in partnership under the name of [FIRM NAME] for the purpose of [BUSINESS PURPOSE].

2. CAPITAL CONTRIBUTION
Each partner shall contribute capital as follows:
Partner 1: INR [AMOUNT]
Partner 2: INR [AMOUNT]

3. PROFIT AND LOSS SHARING
Profits and losses shall be shared in the ratio of [RATIO].

4. MANAGEMENT
All partners shall have equal rights in the management of the partnership business.

5. DUTIES AND RESPONSIBILITIES
Each partner shall [LIST DUTIES AND RESPONSIBILITIES].

6. DISSOLUTION
The partnership may be dissolved by mutual consent or as per the Partnership Act, 1932.

7. GOVERNING LAW
This Deed shall be governed by the Indian Partnership Act, 1932.

IN WITNESS WHEREOF, the partners have executed this Deed:

_________________________          _________________________
Partner 1 Signature                Partner 2 Signature

Date: ______________              Date: ______________`,
    },
  ];

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      insert.run({ id: randomUUID(), ...row });
    }
  });

  insertMany(templates);
}
