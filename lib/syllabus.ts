// AUTO-GENERATED from the uploaded Tracker 360 JSON planners.
// Lecture counts come straight from the JSON files (source of truth).
// Organic Chemistry is intentionally excluded for now.

export type SyllabusStream = {
  id: string
  subject: string
  tag: string | null
  chapters: { id: string; name: string; lectures: number }[]
}

export const SYLLABUS: SyllabusStream[] = [
  {
    "id": "physics",
    "subject": "Physics",
    "tag": null,
    "chapters": [
      {
        "id": "physics-c1",
        "name": "Units and Measurements",
        "lectures": 13
      },
      {
        "id": "physics-c2",
        "name": "Mathematical Tools",
        "lectures": 12
      },
      {
        "id": "physics-c3",
        "name": "Motion in a Straight Line",
        "lectures": 16
      },
      {
        "id": "physics-c4",
        "name": "Motion in a Plane",
        "lectures": 17
      },
      {
        "id": "physics-c5",
        "name": "Laws of Motion + Friction",
        "lectures": 17
      },
      {
        "id": "physics-c6",
        "name": "Circular Motion",
        "lectures": 10
      },
      {
        "id": "physics-c7",
        "name": "Work, Energy and Power",
        "lectures": 12
      },
      {
        "id": "physics-c8",
        "name": "Centre of Mass & System of Particles",
        "lectures": 15
      },
      {
        "id": "physics-c9",
        "name": "Rotational Motion",
        "lectures": 19
      },
      {
        "id": "physics-c10",
        "name": "Gravitation",
        "lectures": 7
      },
      {
        "id": "physics-c11",
        "name": "Mechanical Properties of Solids",
        "lectures": 1
      },
      {
        "id": "physics-c12",
        "name": "Mechanical Properties of Fluids",
        "lectures": 12
      },
      {
        "id": "physics-c13",
        "name": "Thermal Properties of Matter",
        "lectures": 6
      },
      {
        "id": "physics-c14",
        "name": "Kinetic Theory & Thermodynamics",
        "lectures": 5
      },
      {
        "id": "physics-c15",
        "name": "Simple Harmonic Motion",
        "lectures": 6
      },
      {
        "id": "physics-c16",
        "name": "Waves",
        "lectures": 5
      }
    ]
  },
  {
    "id": "pchem",
    "subject": "Chemistry",
    "tag": "Physical Chemistry",
    "chapters": [
      {
        "id": "pchem-c1",
        "name": "Some Basic Concepts of Chemistry",
        "lectures": 20
      },
      {
        "id": "pchem-c2",
        "name": "Structure of Atom",
        "lectures": 15
      },
      {
        "id": "pchem-c3",
        "name": "State of matter",
        "lectures": 10
      },
      {
        "id": "pchem-c4",
        "name": "Thermodynamics",
        "lectures": 13
      },
      {
        "id": "pchem-c5",
        "name": "Redox Reaction",
        "lectures": 5
      },
      {
        "id": "pchem-c6",
        "name": "Chemical Equilibrium",
        "lectures": 8
      },
      {
        "id": "pchem-c7",
        "name": "Ionic Equilibrium",
        "lectures": 7
      }
    ]
  },
  {
    "id": "ichem",
    "subject": "Chemistry",
    "tag": "Inorganic Chemistry",
    "chapters": [
      {
        "id": "ichem-c1",
        "name": "Classification of Elements and Periodicity in Properties",
        "lectures": 14
      },
      {
        "id": "ichem-c2",
        "name": "Chemical Bonding and Molecular Structure",
        "lectures": 26
      },
      {
        "id": "ichem-c3",
        "name": "P-block Elements (Group 13 and 14)",
        "lectures": 5
      },
      {
        "id": "ichem-c4",
        "name": "S-block Element",
        "lectures": 2
      },
      {
        "id": "ichem-c5",
        "name": "Hydrogen and its Compound",
        "lectures": 1
      }
    ]
  },
  {
    "id": "maths",
    "subject": "Mathematics",
    "tag": null,
    "chapters": [
      {
        "id": "maths-c1",
        "name": "Sets",
        "lectures": 7
      },
      {
        "id": "maths-c2",
        "name": "Basic Mathematics",
        "lectures": 20
      },
      {
        "id": "maths-c3",
        "name": "Quadratic Equations",
        "lectures": 9
      },
      {
        "id": "maths-c4",
        "name": "Sequence and Series",
        "lectures": 9
      },
      {
        "id": "maths-c5",
        "name": "Trigonometric Functions",
        "lectures": 11
      },
      {
        "id": "maths-c6",
        "name": "Trigonometric Equation",
        "lectures": 8
      },
      {
        "id": "maths-c7",
        "name": "Relation Function",
        "lectures": 7
      },
      {
        "id": "maths-c8",
        "name": "Permutations and Combinations",
        "lectures": 11
      },
      {
        "id": "maths-c9",
        "name": "Binomial theorem",
        "lectures": 10
      },
      {
        "id": "maths-c10",
        "name": "Straight Lines",
        "lectures": 13
      },
      {
        "id": "maths-c11",
        "name": "Circles",
        "lectures": 10
      },
      {
        "id": "maths-c12",
        "name": "Conic Sections:Parabola",
        "lectures": 9
      },
      {
        "id": "maths-c13",
        "name": "Conic Sections:Ellipse",
        "lectures": 7
      },
      {
        "id": "maths-c14",
        "name": "Conic Sections:Hyperbola",
        "lectures": 5
      },
      {
        "id": "maths-c15",
        "name": "Complex Number",
        "lectures": 10
      },
      {
        "id": "maths-c16",
        "name": "Limits and Derivatives",
        "lectures": 3
      },
      {
        "id": "maths-c17",
        "name": "Statistics",
        "lectures": 4
      },
      {
        "id": "maths-c18",
        "name": "Probability",
        "lectures": 2
      },
      {
        "id": "maths-c19",
        "name": "Introduction to Three Dimensional Geometry",
        "lectures": 2
      },
      {
        "id": "maths-c20",
        "name": "Linear Inequalities",
        "lectures": 2
      },
      {
        "id": "maths-c21",
        "name": "Solution of Triangle",
        "lectures": 2
      }
    ]
  }
]
