package migrator

import (
	"encoding/base64"
	"strconv"

	"github.com/portainer/portainer/api"
)

func (m *Migrator) updateEdgeJobsToDBVersion24() error {
	schedules, err := m.scheduleService.Schedules()
	if err != nil {
		return err
	}

	for _, schedule := range schedules {
		if schedule.EdgeSchedule != nil {
			id := m.edgeJobService.GetNextIdentifier()

			fileContent, err := base64.RawStdEncoding.DecodeString(schedule.EdgeSchedule.Script)
			if err != nil {
				return err
			}

			scriptPath, err := m.fileService.StoreEdgeJobFileFromBytes(strconv.Itoa(id), fileContent)
			if err != nil {
				return err
			}

			edgeJob := &portainer.EdgeJob{
				ID:             portainer.EdgeJobID(id),
				Created:        schedule.Created,
				CronExpression: schedule.CronExpression,
				Endpoints:      schedule.EdgeSchedule.Endpoints,
				Recurring:      schedule.Recurring,
				Name:           schedule.Name,
				Version:        schedule.EdgeSchedule.Version,
				ScriptPath:     scriptPath,
			}

			err = m.edgeJobService.CreateEdgeJob(edgeJob)
			if err != nil {
				return err
			}
		}
	}

	return nil
}
