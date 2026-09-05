import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { installViewport } from '@/testing/viewport/viewport'

beforeEach(installViewport)

afterEach(cleanup)
