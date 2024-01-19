import { Button, Card, Field, Input } from '@fluentui/react-components'
import { useAtom, useAtomValue } from 'jotai'
import { FC, FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { routes } from '../App/index.js'
import { useInsertCommunity } from '../hooks/communities.js'
import {
  communityAtom,
  insertCommunityErrors,
  newProjectUrlAtom,
} from '../state/community.js'
import { useButtonStyles, useMessageStyles } from '../styles/index.js'
import { useCommunityJoinStyles } from './CommunityJoin.styles.js'
import { Message } from './Message.js'

export const CommunityJoin: FC = function Login() {
  const styles = useCommunityJoinStyles()
  const buttonStyles = useButtonStyles()
  const [communityErrors, setCommunityErrors] = useAtom(insertCommunityErrors)
  const [loading, setLoading] = useState(false)
  const messageStyles = useMessageStyles()
  const community = useAtomValue(communityAtom)
  const [projectUrl, setProjectUrl] = useAtom(newProjectUrlAtom)
  const [statusMessage, setStatusMessage] = useState('')
  const navigate = useNavigate()
  const insertCommunity = useInsertCommunity()

  useEffect(() => {
    setProjectUrl(community?.projectUrl ?? '')
  }, [setProjectUrl, community])

  useEffect(() => {
    let message = ''
    setLoading(false)
    if (community?.isMember) {
      navigate(routes.issues.path)
    } else if (community?.joinRequestStatus === 'closed') {
      message = `Your request to join ${community.name} has been denied.`
    } else if (community?.joinRequestStatus === 'open') {
      message = `Your request to join ${community.name} is pending.`
    }
    if (community?.joinRequestUrl != null) {
      message += ` <a href="${community.joinRequestUrl}" target="_blank" rel="noreferrer">View your request in GitHub</a>`
    }
    if (projectUrl !== community?.projectUrl) {
      message = ''
    }
    setStatusMessage(message)
  }, [community, setStatusMessage, navigate, projectUrl, setLoading])

  const dismissError = useCallback(() => {
    setCommunityErrors([])
  }, [setCommunityErrors])

  const submitEnabled = useMemo(() => {
    return (
      projectUrl !== '' &&
      (community?.projectUrl != projectUrl || statusMessage === '')
    )
  }, [projectUrl, statusMessage, community])

  const save = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault()
      setLoading(true)
      await insertCommunity()
      setLoading(false)
    },
    [setLoading, insertCommunity],
  )

  return (
    <Card className={styles.card}>
      {communityErrors.length > 0 && (
        <Message
          messages={communityErrors}
          onClose={dismissError}
          className={messageStyles.error}
        />
      )}
      <form onSubmit={save}>
        <Field
          className={styles.field}
          // @ts-expect-error children signature
          label={{
            children: () => (
              <label htmlFor="communityRepoUrl" className={styles.labelText}>
                Community URL
              </label>
            ),
          }}
        >
          <CommunityUrlMoreInfo />
          <Input
            type="url"
            id="communityRepoUrl"
            value={projectUrl}
            disabled={loading}
            onChange={(e) => setProjectUrl(e.target.value)}
          />
        </Field>

        <div className={styles.buttons}>
          <Button
            shape="circular"
            type="submit"
            disabled={!submitEnabled || loading}
            className={buttonStyles.primary}
          >
            {!loading && 'Request to Join'}
            {loading && (
              <i className="codicon codicon-loading codicon-modifier-spin" />
            )}
          </Button>
        </div>
      </form>
      {statusMessage !== '' && (
        <div>
          <p dangerouslySetInnerHTML={{ __html: statusMessage }}></p>
        </div>
      )}
    </Card>
  )
}

const CommunityUrlMoreInfo: FC = function CommunityUrlMoreInfo() {
  return (
    <div>
      <p>
        URL to a GitHub hosted community repo provided by a community maintainer
        is required.
      </p>
    </div>
  )
}
