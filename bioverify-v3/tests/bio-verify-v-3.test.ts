import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { Agent_FinalizePublication } from "../generated/schema"
import { Agent_FinalizePublication as Agent_FinalizePublicationEvent } from "../generated/BioVerifyV3/BioVerifyV3"
import { handleAgent_FinalizePublication } from "../src/bio-verify-v-3"
import { createAgent_FinalizePublicationEvent } from "./bio-verify-v-3-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let pubId = BigInt.fromI32(234)
    let verdictCid = "Example string value"
    let status = 123
    let newAgent_FinalizePublicationEvent =
      createAgent_FinalizePublicationEvent(pubId, verdictCid, status)
    handleAgent_FinalizePublication(newAgent_FinalizePublicationEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("Agent_FinalizePublication created and stored", () => {
    assert.entityCount("Agent_FinalizePublication", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "Agent_FinalizePublication",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "pubId",
      "234"
    )
    assert.fieldEquals(
      "Agent_FinalizePublication",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "verdictCid",
      "Example string value"
    )
    assert.fieldEquals(
      "Agent_FinalizePublication",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "status",
      "123"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
