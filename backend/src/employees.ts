export interface Employee {
  id: number;
  name: string;
  tagId: string;
  song: string;
}

// Tillfällig lagring i minnet tills PostgreSQL är på plats.
// Allt som läggs till försvinner när servern startas om.
const employees: Employee[] = [
  { id: 1, name: "Anna", tagId: "04:A1:B2:C3", song: "Queen - Don't Stop Me Now" },
  { id: 2, name: "Erik", tagId: "04:D4:E5:F6", song: "Daft Punk - One More Time" },
];

let nextId = 3;

export function getAllEmployees(): Employee[] {
  return employees;
}

export function findByTagId(tagId: string): Employee | undefined {
  return employees.find((employee) => employee.tagId === tagId);
}

export function addEmployee(name: string, tagId: string, song: string): Employee {
  const employee: Employee = { id: nextId++, name, tagId, song };
  employees.push(employee);
  return employee;
}

export function updateSong(id: number, song: string): Employee | undefined {
  const employee = employees.find((employee) => employee.id === id);
  if (employee) {
    employee.song = song;
  }
  return employee;
}
