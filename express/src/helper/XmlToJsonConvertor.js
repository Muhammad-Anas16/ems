import { XMLParser, XMLValidator } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: false,
  trimValues: true,
  isArray: (tagName) => tagName === "record",
});

const XmlToJsonConvertor = (xml) => {
  if (typeof xml !== "string" || !xml.trim()) {
    throw new Error("XML response is empty or invalid.");
  }

  const validation = XMLValidator.validate(xml);

  if (validation !== true) {
    throw new Error("Optergy returned malformed XML.");
  }

  return parser.parse(xml);
};

export default XmlToJsonConvertor;
