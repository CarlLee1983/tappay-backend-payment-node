/**
 * Cardholder information for transactions
 * Used for fraud detection and 3D Secure verification
 */
export interface Cardholder {
  /**
   * Cardholder's phone number
   * Should include country code, e.g., "+886923456789"
   */
  phone_number?: string

  /**
   * Phone number country code
   * Required for international phone numbers
   */
  phone_number_country_code?: string

  /**
   * Cardholder's name
   */
  name?: string

  /**
   * Cardholder's name in English
   * Format: First name + Last name
   */
  name_en?: string

  /**
   * Cardholder's email address
   */
  email?: string

  /**
   * Cardholder's zip/postal code
   */
  zip_code?: string

  /**
   * Cardholder's address
   */
  address?: string

  /**
   * Cardholder's national ID (Taiwan)
   */
  national_id?: string

  /**
   * Member ID in merchant's system
   */
  member_id?: string
}
