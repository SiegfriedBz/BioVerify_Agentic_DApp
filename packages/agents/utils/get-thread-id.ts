type Params = {
  publicationId: string
  rootCid: string
}

export const getThreadId = (params: Params): string => {
  const { publicationId, rootCid } = params

  return `${publicationId}-${rootCid}`
}

export const getPublicationIdFromThreadId = (threadId: string) => {
  return threadId.split('-')[0]
}