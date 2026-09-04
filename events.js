const CALENDAR_EVENTS = [
  {
    "id": "event_0",
    "title": "European EV Charging Infrastructure",
    "start": "2026-01-29",
    "end": "2026-01-30",
    "type": "event",
    "location": "Amsterdam, NL",
    "priority": "High",
    "website": "https://annual-ev-charging-infrastructure.com/"
  },
  {
    "id": "event_1",
    "title": "Charging Infrastructure Congress",
    "start": "2026-02-10",
    "end": "2026-02-10",
    "type": "event",
    "location": "Brussels, BE",
    "priority": "High",
    "website": "https://www.charginginfrastructure.eu/"
  },
  {
    "id": "event_2",
    "title": "EV Charging UK",
    "start": "2026-02-11",
    "end": "2026-02-12",
    "type": "event",
    "location": "London, UK",
    "priority": "High",
    "website": "https://www.uk.evcharging-infrastructure.com/"
  },
  {
    "id": "event_3",
    "title": "EVolution Europe: The Electric Vehicle Conference (EV Summit)",
    "start": "2026-02-24",
    "end": "2026-02-27",
    "type": "event",
    "location": "Amsterdam, NL",
    "priority": "High",
    "website": "https://ev-summit.com/"
  },
  {
    "id": "event_4",
    "title": "4th Annual EV Charging Infrastructure Forum (Leadvent Group)",
    "start": "2026-02-25",
    "end": "2026-02-26",
    "type": "event",
    "location": "Munich, DE",
    "priority": "High",
    "website": "https://www.leadventgrp.com/events/4th-annual-ev-charging-infrastructure-forum/"
  },
  {
    "id": "event_5",
    "title": "WSED – Smart E-Mobility Track",
    "start": "2026-02-25",
    "end": "2026-02-27",
    "type": "event",
    "location": "Wels, AT",
    "priority": "Medium",
    "website": "https://www.wsed.at/"
  },
  {
    "id": "event_6",
    "title": "KEY – The Energy Transition Expo",
    "start": "2026-03-04",
    "end": "2026-03-06",
    "type": "event",
    "location": "Rimini, IT",
    "priority": "Medium",
    "website": "https://www.key-expo.com/"
  },
  {
    "id": "event_7",
    "title": "eMobility Expo World Congress (MOW)",
    "start": "2026-03-10",
    "end": "2026-03-11",
    "type": "event",
    "location": "Malaga, ES",
    "priority": "High",
    "website": "https://emobilityworldcongress.com/"
  },
  {
    "id": "event_8",
    "title": "Solar Solutions",
    "start": "2026-03-10",
    "end": "2026-03-12",
    "type": "event",
    "location": "Amsterdam, NL",
    "priority": "Low",
    "website": "https://www.solarsolutions.nl/"
  },
  {
    "id": "event_9",
    "title": "Vehicle-to-Grid, Vehicle-to-Home & Smart Charging Conference",
    "start": "2026-04-15",
    "end": "2026-04-16",
    "type": "event",
    "location": "Münster, DE",
    "priority": "Medium",
    "website": "https://www.vehicle-2-grid.eu/en/"
  },
  {
    "id": "event_10",
    "title": "EV Infrastructure Expo",
    "start": "2026-04-23",
    "end": "2026-04-24",
    "type": "event",
    "location": "Silverstone, UK",
    "priority": "Medium",
    "website": "https://evinfraexpo.com/"
  },
  {
    "id": "event_11",
    "title": "ChargeTec",
    "start": "2026-04-28",
    "end": "2026-04-29",
    "type": "event",
    "location": "Munich, DE",
    "priority": "High",
    "website": "https://www.chargetec-online.de/en/"
  },
  {
    "id": "event_12",
    "title": "Euro EV Show (EEVS)",
    "start": "2026-05-05",
    "end": "2026-05-06",
    "type": "event",
    "location": "Madrid, ES",
    "priority": "Medium",
    "website": "https://www.euroevshow.com/"
  },
  {
    "id": "event_13",
    "title": "Nordic EV Summit",
    "start": "2026-05-06",
    "end": "2026-05-07",
    "type": "event",
    "location": "Lillestrom, NO",
    "priority": "Medium",
    "website": "https://www.nordicevs.com/"
  },
  {
    "id": "event_14",
    "title": "Everything Electric North",
    "start": "2026-05-08",
    "end": "2026-05-09",
    "type": "event",
    "location": "Harrogate, UK",
    "priority": "Low",
    "website": "https://www.everythingelectricnorth.co.uk/"
  },
  {
    "id": "event_15",
    "title": "London EV Show",
    "start": "2026-05-13",
    "end": "2026-05-14",
    "type": "event",
    "location": "London, UK",
    "priority": "High",
    "website": "https://www.londonevshow.com/"
  },
  {
    "id": "event_16",
    "title": "Drive to Zero",
    "start": "2026-06-02",
    "end": "2026-06-03",
    "type": "event",
    "location": "Paris, FR",
    "priority": "Medium",
    "website": "https://drivetozero.co.uk/"
  },
  {
    "id": "event_17",
    "title": "The Battery Show Europe / EV Tech Expo Europe",
    "start": "2026-06-09",
    "end": "2026-06-11",
    "type": "event",
    "location": "Stuttgart, DE",
    "priority": "High",
    "website": "https://www.thebatteryshow.eu/"
  },
  {
    "id": "event_18",
    "title": "iVT Expo",
    "start": "2026-06-10",
    "end": "2026-06-11",
    "type": "event",
    "location": "Cologne, DE",
    "priority": "Low",
    "website": "https://www.ivtexpo.com/"
  },
  {
    "id": "event_19",
    "title": "MOVE",
    "start": "2026-06-17",
    "end": "2026-06-18",
    "type": "event",
    "location": "London, UK",
    "priority": "High",
    "website": "https://www.terrapinn.com/exhibition/move/index.stm"
  },
  {
    "id": "event_20",
    "title": "Power2Drive Europe Conference",
    "start": "2026-06-22",
    "end": "2026-06-23",
    "type": "event",
    "location": "Munich, DE",
    "priority": "High",
    "website": "https://www.powertodrive.eu/"
  },
  {
    "id": "event_21",
    "title": "Power2Drive Europe (Exhibition)",
    "start": "2026-06-23",
    "end": "2026-06-25",
    "type": "event",
    "location": "Munich, DE",
    "priority": "High",
    "website": "https://www.powertodrive.eu/"
  },
  {
    "id": "event_22",
    "title": "Vehicle Electrification Expo",
    "start": "2026-07-08",
    "end": "2026-07-09",
    "type": "event",
    "location": "Birmingham, UK",
    "priority": "Medium",
    "website": "https://www.vehicleelectrificationexpo.co.uk/"
  },
  {
    "id": "event_25",
    "title": "Intercharge Network Conference (ICNC)",
    "start": "2026-09-01",
    "end": "2026-09-03",
    "type": "event",
    "location": "Berlin Tempelhof, DE",
    "priority": "High",
    "website": "https://www.intercharge-network-conference.com/",
    "status": "going",
    "who": "Derek Wright, Altug Iscanli",
    "icp": "CPO / partners"
  },
  {
    "id": "event_32",
    "title": "Euro EV Show (September)",
    "start": "2026-09-10",
    "end": "2026-09-11",
    "type": "event",
    "location": "Madrid (La Nave), ES",
    "priority": "Medium",
    "website": "https://www.euroevshow.com/",
    "status": "considering",
    "icp": "installer / partners"
  },
  {
    "id": "event_33",
    "title": "IAA Transportation",
    "start": "2026-09-15",
    "end": "2026-09-20",
    "type": "event",
    "location": "Hannover, DE",
    "priority": "Medium",
    "website": "https://www.iaa-transportation.com/en",
    "status": "considering",
    "icp": "fleet / depot"
  },
  {
    "id": "event_23",
    "title": "Everything Electric Greater London",
    "start": "2026-09-11",
    "end": "2026-09-12",
    "type": "event",
    "location": "London, UK",
    "priority": "Medium",
    "website": "https://www.everythingelectric.co.uk/"
  },
  {
    "id": "cd_aria_precheck_2026-09-07",
    "title": "Aria charger pre-check + informal office",
    "start": "2026-09-07",
    "end": "2026-09-07",
    "type": "other",
    "location": "NL (Delft / Amsterdam)",
    "priority": "High",
    "status": "going",
    "who": "Derek / Aria",
    "notes": "NLC-59. My Wheels Zoe Z50 preferred (alt ID3 near Open Bar). Informal Teams office invite — no standup. Contact Make a Space Delft. Prelims before Tue on-site."
  },
  {
    "id": "cd_aria_onsite_2026-09-08",
    "title": "Aria on-site charger test (afternoon)",
    "start": "2026-09-08",
    "end": "2026-09-08",
    "type": "other",
    "location": "NL",
    "priority": "High",
    "status": "going",
    "who": "Derek / Aria",
    "notes": "NLC-59 / NLC-56. Afternoon on-site real-car ISO 15118 test after Mon prelims."
  },
  {
    "id": "cd_thomas_doctor_response_2026-09-07",
    "title": "Thomas: written response due (Spain vs company doctor)",
    "start": "2026-09-07",
    "end": "2026-09-07",
    "type": "other",
    "priority": "High",
    "status": "going",
    "who": "Derek",
    "notes": "NLC-75. Written response due Monday — Spain travel as holiday vs company-doctor report. Draft on Linear; Derek sends."
  },
  {
    "id": "event_39",
    "title": "EV Experience",
    "start": "2026-09-24",
    "end": "2026-09-26",
    "type": "event",
    "location": "Circuit Zandvoort, NL",
    "priority": "High",
    "website": "https://evexperience.nl/",
    "status": "skip",
    "icp": "fleet / NL brand",
    "notes": "NLC-50 prior favourite for C1 launch. Thu/Fri B2B. Timing too early if C1 not ready before Nov — keep as skip/visitor-only unless readiness moves."
  },
  {
    "id": "event_24",
    "title": "EVCharge Live UK",
    "start": "2026-09-22",
    "end": "2026-09-24",
    "type": "event",
    "location": "Birmingham, UK",
    "priority": "High",
    "website": "https://evchargelive.co.uk/",
    "status": "considering",
    "icp": "CPO / installer",
    "notes": "Clash week: CharIN Blomberg, OCPP Dublin, New Mobility Congress Katowice"
  },
  {
    "id": "event_34",
    "title": "CharIN Testival & Conference EUROPE",
    "start": "2026-09-22",
    "end": "2026-09-25",
    "type": "event",
    "location": "Blomberg, DE",
    "priority": "High",
    "website": "https://www.charin.global/events/charin-testival-conference-europe-2026-germany/",
    "status": "considering",
    "icp": "interop",
    "notes": "Clash week with EVCharge Live UK, OCPP Dublin, Katowice"
  },
  {
    "id": "event_35",
    "title": "OCPP Plugfest & Conference Europe",
    "start": "2026-09-22",
    "end": "2026-09-23",
    "type": "event",
    "location": "Dublin, IE",
    "priority": "High",
    "website": "https://openchargealliance.org/events/ocpp-plugfest-europe/",
    "status": "considering",
    "icp": "interop",
    "notes": "Clash week with EVCharge Live UK, CharIN, Katowice"
  },
  {
    "id": "event_36",
    "title": "New Mobility Congress",
    "start": "2026-09-23",
    "end": "2026-09-25",
    "type": "event",
    "location": "Katowice, PL",
    "priority": "Medium",
    "website": "https://kongresnowejmobilnosci.pl/en/homepage/",
    "status": "considering",
    "icp": "CPO / CEE",
    "notes": "Clash week with EVCharge Live UK, CharIN, OCPP Dublin"
  },
  {
    "id": "event_26",
    "title": "Energie Vakbeurs",
    "start": "2026-10-06",
    "end": "2026-10-08",
    "type": "event",
    "location": "Den Bosch, NL",
    "priority": "Medium",
    "website": "https://www.energievakbeurs.nl/"
  },
  {
    "id": "event_27",
    "title": "E-CHARGE",
    "start": "2026-10-07",
    "end": "2026-10-09",
    "type": "event",
    "location": "Bologna, IT",
    "priority": "Medium",
    "website": "https://www.e-charge.it/",
    "status": "skip",
    "icp": "installer / IT",
    "notes": "NLC-50 shortlist; too early if C1 not ready before Nov."
  },
  {
    "id": "event_28",
    "title": "E-TECH EUROPE",
    "start": "2026-10-07",
    "end": "2026-10-09",
    "type": "event",
    "location": "Bologna, IT",
    "priority": "Medium",
    "website": "https://www.e-techeurope.com/"
  },
  {
    "id": "event_29",
    "title": "eMove360 Europe",
    "start": "2026-10-13",
    "end": "2026-10-14",
    "type": "event",
    "location": "Munich, DE",
    "priority": "High",
    "website": "https://www.emove360.com/"
  },
  {
    "id": "event_40",
    "title": "Fleet Electrification & Decarbonisation Forum",
    "start": "2026-11-18",
    "end": "2026-11-19",
    "type": "event",
    "location": "Amsterdam, NL",
    "priority": "High",
    "website": "https://www.leadventgrp.com/events/fleet-electrification-and-decarbonisation-forum/details",
    "status": "considering",
    "icp": "fleet / B2B",
    "notes": "NLC-50 primary C1 soft-launch candidate if ready Nov+. Same week as London EV Show — pick one primary. Showcase/sponsor packages."
  },
  {
    "id": "event_37",
    "title": "London EV Show (November)",
    "start": "2026-11-18",
    "end": "2026-11-19",
    "type": "event",
    "location": "ExCeL London, UK",
    "priority": "Medium",
    "website": "https://www.londonevshow.com/",
    "status": "considering",
    "icp": "partners / UK",
    "notes": "NLC-50: same week as Fleet Forum Amsterdam — pick one primary. Higher cost (~€19–36k prior quote)."
  },
  {
    "id": "event_38",
    "title": "V2G Summit",
    "start": "2026-12-01",
    "end": "2026-12-02",
    "type": "event",
    "location": "NEMO Science Museum, Amsterdam, NL",
    "priority": "High",
    "website": "https://www.v2gsummit.de/",
    "status": "considering",
    "icp": "V2G / grid / energy",
    "notes": "Conexio-PSE. Tickets: https://conexiopse_en.univents.world/events/152126. Clash week with eMobility Expo Warsaw."
  },
  {
    "id": "event_30",
    "title": "eMobility Expo",
    "start": "2026-12-01",
    "end": "2026-12-03",
    "type": "event",
    "location": "Warsaw, PL",
    "priority": "Medium",
    "website": "https://emobilityexpo.pl/"
  },
  {
    "id": "event_31",
    "title": "Congress Charging Infrastructure (Congres Laadinfra)",
    "start": "2026-05-12",
    "end": "2026-05-12",
    "type": "event",
    "location": "Amersfoort, NL",
    "priority": "High",
    "website": "https://www.congreslaadinfra.nl/en/"
  },
  {
    "id": "event_41",
    "title": "7th European EV Charging Infrastructure",
    "start": "2027-01-28",
    "end": "2027-01-29",
    "type": "event",
    "location": "NH Amsterdam Zuid, Amsterdam, NL",
    "priority": "High",
    "website": "https://annual-ev-charging-infrastructure.com/",
    "status": "considering",
    "icp": "CPO / infra / fleet",
    "notes": "NLC-50 backup if C1 misses Nov soft launch. Prospero conference; delegate ~€1499; sponsorship/speaking packages available."
  },
  {
    "id": "h1",
    "title": "New Year's Day",
    "start": "2026-01-01",
    "end": "2026-01-01",
    "type": "holiday"
  },
  {
    "id": "h3",
    "title": "Easter Sunday",
    "start": "2026-04-05",
    "end": "2026-04-05",
    "type": "holiday"
  },
  {
    "id": "h4",
    "title": "Easter Monday",
    "start": "2026-04-06",
    "end": "2026-04-06",
    "type": "holiday"
  },
  {
    "id": "h5",
    "title": "King's Day",
    "start": "2026-04-27",
    "end": "2026-04-27",
    "type": "holiday"
  },
  {
    "id": "h6",
    "title": "Ascension Day",
    "start": "2026-05-14",
    "end": "2026-05-14",
    "type": "holiday"
  },
  {
    "id": "h7",
    "title": "Whit Sunday",
    "start": "2026-05-24",
    "end": "2026-05-24",
    "type": "holiday"
  },
  {
    "id": "h8",
    "title": "Whit Monday",
    "start": "2026-05-25",
    "end": "2026-05-25",
    "type": "holiday"
  },
  {
    "id": "h9",
    "title": "Christmas Day",
    "start": "2026-12-25",
    "end": "2026-12-25",
    "type": "holiday"
  },
 {
 "id": "social_1",
 "title": "Team social",
 "start": "2026-09-10",
 "end": "2026-09-10",
 "type": "social",
 "notes": "Placeholder social day — rename or replace from Add event."
 },
  {
    "id": "wfh_martina_2026-09-21",
    "title": "Martina",
    "start": "2026-09-21",
    "end": "2026-09-21",
    "type": "wfh",
    "notes": "WFH abroad"
  },
  {
    "id": "h10",
    "title": "Boxing Day",
    "start": "2026-12-26",
    "end": "2026-12-26",
    "type": "holiday"
  }
];
