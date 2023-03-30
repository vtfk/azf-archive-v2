module.exports = {
  archiveTemplate: () => {
    return {
      service: 'AccessGroupService',
      method: 'GetAccessGroups',
      parameter: {
        IncludeMembers: false,
        MaxRows: 3000
      }
    }
  },
  requiredFields: {}
}
