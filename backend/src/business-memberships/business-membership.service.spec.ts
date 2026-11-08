import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { BusinessMembershipService, type Actor } from './business-membership.service.js';
import { canGrant, canManage } from './membership-rules.js';
import { FakePrisma } from '../../test/fake-prisma.js';

describe('membership rules', () => {
  it('OWNER can manage and grant anything', () => {
    expect(canManage('OWNER', 'OWNER', 'VIEWER')).toBe(true);
    expect(canGrant('OWNER', 'OWNER')).toBe(true);
  });

  it('ADMIN can only manage and grant roles below ADMIN', () => {
    expect(canGrant('ADMIN', 'OWNER')).toBe(false);
    expect(canGrant('ADMIN', 'ADMIN')).toBe(false);
    expect(canGrant('ADMIN', 'MANAGER')).toBe(true);
    expect(canManage('ADMIN', 'OWNER')).toBe(false);
    expect(canManage('ADMIN', 'ADMIN')).toBe(false);
    expect(canManage('ADMIN', 'EMPLOYEE', 'MANAGER')).toBe(true);
    expect(canManage('ADMIN', 'EMPLOYEE', 'ADMIN')).toBe(false);
  });
});

describe('BusinessMembershipService', () => {
  const BIZ = '22222222-2222-4222-8222-222222222222';
  let prisma: FakePrisma;
  let service: BusinessMembershipService;
  let owner: { id: string };
  let ownerMembership: { id: string };
  const audit = { record: vi.fn() };

  beforeEach(async () => {
    prisma = new FakePrisma();
    service = new BusinessMembershipService(prisma as never, audit as never);
    owner = prisma.addUser();
    ownerMembership = await prisma.businessMembership.create({
      data: { userId: owner.id, businessId: BIZ, role: 'OWNER', status: 'ACTIVE' },
    });
  });

  const ownerActor = (): Actor => ({ userId: owner.id, role: MembershipRole.OWNER });

  it('will not let the last OWNER leave', async () => {
    await expect(service.remove(ownerActor(), BIZ, ownerMembership.id)).rejects.toBeInstanceOf(ConflictException);
  });

  it('will not let the last OWNER be demoted', async () => {
    await expect(service.changeRole(ownerActor(), BIZ, ownerMembership.id, 'ADMIN')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('allows an OWNER to step down once there is another OWNER', async () => {
    const other = prisma.addUser();
    await prisma.businessMembership.create({
      data: { userId: other.id, businessId: BIZ, role: 'OWNER', status: 'ACTIVE' },
    });
    await expect(service.changeRole(ownerActor(), BIZ, ownerMembership.id, 'ADMIN')).resolves.toMatchObject({
      role: 'ADMIN',
    });
  });

  it('does not let an ADMIN invite an OWNER', async () => {
    const invitee = prisma.addUser();
    await expect(
      service.invite({ userId: 'admin', role: 'ADMIN' }, BIZ, { email: invitee.email, role: 'OWNER' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('does not let an ADMIN remove an OWNER', async () => {
    await expect(service.remove({ userId: 'admin', role: 'ADMIN' }, BIZ, ownerMembership.id)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('treats a membership id from another business as not found', async () => {
    await expect(
      service.remove(ownerActor(), '99999999-9999-4999-8999-999999999999', ownerMembership.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('invites an existing user as INVITED and audits it', async () => {
    const invitee = prisma.addUser();
    const result = await service.invite(ownerActor(), BIZ, { email: invitee.email, role: 'EMPLOYEE' });
    expect(result).toMatchObject({ role: 'EMPLOYEE', status: 'INVITED' });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'membership.invited' }), prisma);
  });
});
