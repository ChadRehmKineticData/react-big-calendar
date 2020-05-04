import PropTypes from 'prop-types'
import React from 'react'
import EventRowMixin from './EventRowMixin'
import { eventLevels } from './utils/eventLevels'
import range from 'lodash/range'

let isSegmentInSlot = (seg, slot, x) => {
  if (x) {
    // console.log(`Return ${seg.left <= slot && seg.right >= slot}`)
  }
  return seg.left <= slot && seg.right >= slot
}
let eventsInSlot = (segments, slot, x) => {
  if (x) {
    console.log(`Slot ${slot}`)
  }
  return segments.filter(seg => isSegmentInSlot(seg, slot, true && x)).length
}
class EventEndingRow extends React.Component {
  render() {
    let {
      segments,
      slotMetrics: { slots },
    } = this.props
    let rowSegments = eventLevels(segments).levels[0]

    let current = 1,
      lastEnd = 1,
      row = []

    while (current <= slots) {
      let key = '_lvl_' + current

      let { event, left, right, span } =
        rowSegments.filter(seg => isSegmentInSlot(seg, current, false))[0] || {} //eslint-disable-line

      if (!event) {
        console.log(rowSegments)
        current++
        continue
      }

      let gap = Math.max(0, left - lastEnd)
      // console.log(`Span ${span}`)
      if (this.canRenderSlotEvent(left, span)) {
        let content = EventRowMixin.renderEvent(this.props, event)

        if (gap) {
          row.push(EventRowMixin.renderSpan(slots, gap, key + '_gap'))
        }

        row.push(EventRowMixin.renderSpan(slots, span, key, content))

        lastEnd = current = right + 1
      } else {
        if (gap) {
          row.push(EventRowMixin.renderSpan(slots, gap, key + '_gap'))
        }

        row.push(
          EventRowMixin.renderSpan(
            slots,
            1,
            key,
            this.renderShowMore(segments, current)
          )
        )
        lastEnd = current = current + 1
      }
    }

    return <div className="rbc-row">{row}</div>
  }

  canRenderSlotEvent(slot, span) {
    let { segments } = this.props

    return range(slot, slot + span).every(s => {
      let count = eventsInSlot(segments, s, false)

      return count === 1
    })
  }

  renderShowMore(segments, slot) {
    let { localizer } = this.props
    let count = eventsInSlot(segments, slot, true)

    return count ? (
      <a
        key={'sm_' + slot}
        href="#"
        className={'rbc-show-more'}
        onClick={e => this.showMore(slot, e)}
      >
        {localizer.messages.showMore(count)}
      </a>
    ) : (
      false
    )
  }

  showMore(slot, e) {
    e.preventDefault()
    this.props.onShowMore(slot, e.target)
  }
}

EventEndingRow.propTypes = {
  segments: PropTypes.array,
  slots: PropTypes.number,
  onShowMore: PropTypes.func,
  ...EventRowMixin.propTypes,
}

EventEndingRow.defaultProps = {
  ...EventRowMixin.defaultProps,
}

export default EventEndingRow
