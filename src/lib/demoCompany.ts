import profiles from "../../public/demo-evidence/company-profiles.json";
import type { CompanyProfile } from "./types";

const companies = profiles as CompanyProfile[];

export function getDemoCompany(startupId: string) {
  return companies.find(company => company.startupId === startupId);
}

export function getDemoEvidence(profile: CompanyProfile) {
  const company = companies.find(company => company.legalName === profile.legalName &&
    company.registrationNumber === profile.registrationNumber && company.country === profile.country);
  if (!company) return null;
  const filename = company.startupId === "paylah-lite" ? "01-matching-company-record" : `${company.startupId}-company-record`;
  return `/demo-evidence/${filename}.png`;
}
