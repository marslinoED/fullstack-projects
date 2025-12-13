class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ["sortBy", "fields", "page", "limit"];
    excludeFields.forEach((el) => delete queryObj[el]);

    const mongoQuery = {};

    for (const key in queryObj) {
      const value = queryObj[key];

      // case 1: parsed object (local)
      if (typeof value === "object") {
        mongoQuery[key] = {};
        for (const op in value) {
          mongoQuery[key][`$${op}`] = Number(value[op]);
        }
      }

      // case 2: flat key from Vercel => duration[gte]
      else if (key.includes("[")) {
        const [field, op] = key.replace("]", "").split("[");
        mongoQuery[field] = {
          ...(mongoQuery[field] || {}),
          [`$${op}`]: Number(value),
        };
      }

      // case 3: normal filter
      else {
        mongoQuery[key] = value;
      }
    }

    this.query = this.query.find(mongoQuery);
    return this;
  }

  sort(deafaultSort = " -createdAt") {
    // Sorting
    if (this.queryString.sortBy) {
      const sortByArr = this.queryString.sortBy.split(",").join(" ");
      this.query = this.query.sort(sortByArr + " -createdAt");
    } else {
      this.query = this.query.sort(deafaultSort);
    }

    return this;
  }
  fieldLimit(execludedFields = []) {
    // Field Limiting
    if (this.queryString.fields) {
      const fieldsArr = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fieldsArr);
    } else {
      this.query = this.query.select(execludedFields.join(" "));
    }

    return this;
  }
  paginate() {
    // Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
