import { config } from "../config.tool"

export const mapUtilitiesIntoOverride = () => {
  const utilities = [...config.utilities]?.filter(u => u.overrides?.length >= 1)

  const overrides = utilities
    ?.map(u => {
      const { variations, overrides } = u

      const defaultVariation = Object.entries(variations)
        ?.find(([key]) => key === 'default')
        ?.[1]
      
      const mappedOverrides = overrides
        ?.map(o => `$${o}: ${defaultVariation};`)
        ?.join('\n')
      return mappedOverrides
    })
    ?.join('\n')

  return overrides
}