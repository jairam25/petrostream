/**
 * Academic Reference Database for Geoscientists
 */

export interface Reference {
  id: string;
  title: string;
  authors: string;
  year: number;
  topic: 'Seismic' | 'Petrophysics' | 'Geology' | 'Gravity/Mag' | 'Production' | 'Reservoir';
  difficulty: 'Foundational' | 'Advanced' | 'Expert';
  tags: string[];
  summary: string;
  citation: string;
}

export const ACADEMIC_LIBRARY: Reference[] = [
  {
    id: 'zoeppritz-1919',
    title: 'Erdbebenwellen VII',
    authors: 'Karl Zoeppritz',
    year: 1919,
    topic: 'Seismic',
    difficulty: 'Expert',
    tags: ['AVO', 'Amplitude', 'Rock Physics'],
    summary: 'The bedrock of modern seismic amplitude analysis. These equations describe the partitioning of seismic energy at an interface, relating reflection/transmission coefficients to the physical properties of the layers. Essential for understanding AVO (Amplitude Variation with Offset).',
    citation: 'Zoeppritz, K., 1919, Erdbebenwellen VII, Nachrichten v. d. Konigl. Gessellschaft der Wissenshaften zu Gottingen, Mathematisch-physikalische Klasse, 66-84.'
  },
  {
    id: 'gardner-1974',
    title: 'Formation velocity and density—The diagnostic basics for stratigraphic traps',
    authors: 'G.H.F. Gardner, L.W. Gardner, A.R. Gregory',
    year: 1974,
    topic: 'Seismic',
    difficulty: 'Foundational',
    tags: ['Density', 'Velocity', 'Stratigraphy'],
    summary: 'Established the empirical relation between bulk density and P-wave velocity (rho = a * V^b). This is the industry-standard "Gardner\'s Relation" used to estimate density logs when they are missing or to predict AI from sonic data.',
    citation: 'Gardner, G. H. F., Gardner, L. W., and Gregory, A. R., 1974, Formation velocity and density—The diagnostic basics for stratigraphic traps: Geophysics, 39, 770–780.'
  },
  {
    id: 'archie-1942',
    title: 'The Electrical Resistivity Log as an Aid in Determining Some Reservoir Characteristics',
    authors: 'G.E. Archie',
    year: 1942,
    topic: 'Petrophysics',
    difficulty: 'Foundational',
    tags: ['Resistivity', 'Saturation', 'Porosity'],
    summary: 'The most influential paper in petrophysics. It defined the relationship between electrical resistivity of rocks, their porosity, and their water saturation. Without Archie\'s Equation, calculating oil in place would be guesswork.',
    citation: 'Archie, G.E. (1942). The Electrical Resistivity Log as an Aid in Determining Some Reservoir Characteristics. Transactions of the AIME. 146: 54–62.'
  },
  {
    id: 'wyllie-1956',
    title: 'Elastic Wave Velocities in Heterogeneous and Porous Media',
    authors: 'M.R.J. Wyllie, A.R. Gregory, L.W. Gardner',
    year: 1956,
    topic: 'Petrophysics',
    difficulty: 'Foundational',
    tags: ['Sonic', 'Porosity', 'Time-Average'],
    summary: 'Introduced the "Time-Average Equation" which relates the total travel time of an elastic wave to the sum of travel times through the fluid and solid matrix. A key tool for estimating porosity from sonic logs.',
    citation: 'Wyllie, M. R. J., Gregory, A. R., and Gardner, L. W., 1956, Elastic wave velocities in heterogeneous and porous media: Geophysics, 21, 41–70.'
  },
  {
    id: 'vogel-1968',
    title: 'Inflow Performance Relationships for Solution-Gas Drive Wells',
    authors: 'J.V. Vogel',
    year: 1968,
    topic: 'Production',
    difficulty: 'Foundational',
    tags: ['IPR', 'Solution-Gas', 'Two-Phase Flow'],
    summary: 'Revolutionized production engineering by introducing a simple, empirical relationship for the inflow performance of wells producing below the bubble point. The Vogel IPR curve is still the standard for two-phase flow analysis.',
    citation: 'Vogel, J. V., 1968, Inflow Performance Relationships for Solution-Gas Drive Wells: Journal of Petroleum Technology, 20(01), 83-92.'
  },
  {
    id: 'fetkovich-1980',
    title: 'Decline Curve Analysis Using Type Curves',
    authors: 'M.J. Fetkovich',
    year: 1980,
    topic: 'Reservoir',
    difficulty: 'Advanced',
    tags: ['DCA', 'Type Curves', 'Reservoir Management'],
    summary: 'Unified the empirical Arps decline curves with the analytical solutions for constant-pressure fluid flow. This enabled engineers to estimate both reservoir properties and future reserves from production data.',
    citation: 'Fetkovich, M. J., 1980, Decline Curve Analysis Using Type Curves: Journal of Petroleum Technology, 32(06), 1065-1077.'
  },
  {
    id: 'beggs-brill-1973',
    title: 'A Study of Two-Phase Flow in Inclined Pipes',
    authors: 'H.D. Beggs, J.P. Brill',
    year: 1973,
    topic: 'Production',
    difficulty: 'Advanced',
    tags: ['VLP', 'Two-Phase Flow', 'Multiphase'],
    summary: 'Developed one of the most widely used correlations for predicting pressure drop and liquid holdup in multiphase flow. Unique for its applicability to all angles of inclination.',
    citation: 'Beggs, H. D., and Brill, J. P., 1973, A Study of Two-Phase Flow in Inclined Pipes: Journal of Petroleum Technology, 25(05), 607-617.'
  },
  {
    id: 'havlena-odeh-1963',
    title: 'The Material Balance as an Equation of a Straight Line',
    authors: 'D. Havlena, A.S. Odeh',
    year: 1963,
    topic: 'Reservoir',
    difficulty: 'Advanced',
    tags: ['Material Balance', 'Reservoir Drive', 'Straight Line'],
    summary: 'Transformed the complex material balance equation into a series of straight-line plots. This allowed engineers to visually identify the drive mechanism and estimate initial oil in place (N) more accurately.',
    citation: 'Havlena, D., and Odeh, A. S., 1963, The Material Balance as an Equation of a Straight Line: Journal of Petroleum Technology, 15(08), 896-900.'
  },
  {
    id: 'joshi-1988',
    title: 'Augmentation of Well Productivity with Slant and Horizontal Wells',
    authors: 'S.D. Joshi',
    year: 1988,
    topic: 'Production',
    difficulty: 'Advanced',
    tags: ['Horizontal Wells', 'Productivity', 'Slant Wells'],
    summary: 'Provided the foundational analytical models for predicting the productivity of horizontal wells compared to vertical ones. Critical for the development of unconventional and thin-bed reservoirs.',
    citation: 'Joshi, S. D., 1988, Augmentation of Well Productivity with Slant and Horizontal Wells: Journal of Petroleum Technology, 40(06), 729-739.'
  }
];
