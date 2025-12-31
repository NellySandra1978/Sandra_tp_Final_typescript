export class User {
  id: string;
  name: string;
  email: string;

  constructor(name: string, email: string) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.email = email.toLowerCase().trim(); // Normaliser l'email
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const institutionRegex = /@.*\.(edu|ac\.|univ\.|institution\.)/i;
    return emailRegex.test(email) && institutionRegex.test(email);
  }
}

