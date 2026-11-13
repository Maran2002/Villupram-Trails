class RequestBodyError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function readJson(request, maxBytes = 32 * 1024) {
  const tooLarge = () => new RequestBodyError('Request body is too large', 413)
  if (Number(request.headers.get('content-length')) > maxBytes) throw tooLarge()
  const reader = request.body?.getReader()
  if (!reader) throw new RequestBodyError('Expected a JSON object', 400)

  const decoder = new TextDecoder('utf-8', { fatal: true })
  let size = 0
  let json = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBytes) {
        void reader.cancel().catch(() => {})
        throw tooLarge()
      }
      json += decoder.decode(value, { stream: true })
    }
    const data = JSON.parse(json + decoder.decode())
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new RequestBodyError('Expected a JSON object', 400)
    }
    return data
  } catch (error) {
    if (error instanceof RequestBodyError) throw error
    throw new RequestBodyError('Invalid JSON request body', 400)
  } finally {
    reader.releaseLock()
  }
}

export function requestBodyError(error) {
  if (!(error instanceof RequestBodyError)) return null
  return Response.json({ success: false, error: error.message }, { status: error.status })
}
