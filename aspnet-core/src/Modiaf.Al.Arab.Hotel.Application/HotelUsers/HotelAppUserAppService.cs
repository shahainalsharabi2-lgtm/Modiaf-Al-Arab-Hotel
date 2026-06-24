using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
namespace Modiaf.Al.Arab.Hotel.HotelUsers;

[AllowAnonymous]
public class HotelAppUserAppService(IRepository<HotelAppUser, int> repository)
    : CrudAppService<HotelAppUser, HotelAppUserDto, int, PagedAndSortedResultRequestDto, CreateUpdateHotelAppUserDto>(
        repository),
        IHotelAppUserAppService
{
    protected override async Task<IQueryable<HotelAppUser>> CreateFilteredQueryAsync(
        PagedAndSortedResultRequestDto input)
    {
        var query = await ReadOnlyRepository.GetQueryableAsync();
        var excludedUserName = HotelSystemOwner.UserName.ToLowerInvariant();
        return query
            .Where(x => x.UserName.ToLower() != excludedUserName)
            .OrderBy(x => x.UserName);
    }

    public override async Task<HotelAppUserDto> CreateAsync(CreateUpdateHotelAppUserDto input)
    {
        EnsureNotSystemOwnerAccount(input.UserName);
        if (string.IsNullOrWhiteSpace(input.Password))
        {
            throw new UserFriendlyException("كلمة المرور مطلوبة عند إنشاء مستخدم جديد.");
        }

        await EnsureUserNameAvailableAsync(input.UserName);
        return await base.CreateAsync(input);
    }

    public override async Task<HotelAppUserDto> UpdateAsync(int id, CreateUpdateHotelAppUserDto input)
    {
        var existing = await repository.GetAsync(id);
        EnsureNotSystemOwnerAccount(existing.UserName);
        EnsureNotSystemOwnerAccount(input.UserName);
        await EnsureUserNameAvailableAsync(input.UserName, id);
        return await base.UpdateAsync(id, input);
    }

    public override async Task DeleteAsync(int id)
    {
        var existing = await repository.GetAsync(id);
        EnsureNotSystemOwnerAccount(existing.UserName);
        await base.DeleteAsync(id);
    }

    protected override HotelAppUserDto MapToGetOutputDto(HotelAppUser entity) =>
        new()
        {
            Id = entity.Id,
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            UserName = entity.UserName,
            Email = entity.Email,
            PhoneNumber = entity.PhoneNumber,
            Password = entity.Password,
            Role = entity.Role,
            AllowNavigation = entity.AllowNavigation,
            LandingPagePath = entity.LandingPagePath,
            DenyUserManagement = entity.DenyUserManagement,
        };

    protected override HotelAppUser MapToEntity(CreateUpdateHotelAppUserDto createInput)
    {
        var entity = new HotelAppUser(
            createInput.FirstName.Trim(),
            createInput.LastName.Trim(),
            createInput.UserName.Trim(),
            (createInput.Email ?? string.Empty).Trim(),
            (createInput.PhoneNumber ?? string.Empty).Trim(),
            createInput.Password,
            createInput.Role);
        entity.AllowNavigation = createInput.AllowNavigation;
        entity.LandingPagePath = NormalizeLandingPagePath(createInput.LandingPagePath);
        entity.DenyUserManagement = createInput.DenyUserManagement;
        return entity;
    }

    protected override void MapToEntity(CreateUpdateHotelAppUserDto updateInput, HotelAppUser entity)
    {
        entity.FirstName = updateInput.FirstName.Trim();
        entity.LastName = updateInput.LastName.Trim();
        entity.UserName = updateInput.UserName.Trim();
        entity.Email = (updateInput.Email ?? string.Empty).Trim();
        entity.PhoneNumber = (updateInput.PhoneNumber ?? string.Empty).Trim();
        entity.Role = HotelUserRoles.Normalize(updateInput.Role);
        entity.AllowNavigation = updateInput.AllowNavigation;
        entity.LandingPagePath = NormalizeLandingPagePath(updateInput.LandingPagePath);
        entity.DenyUserManagement = updateInput.DenyUserManagement;
        if (!string.IsNullOrWhiteSpace(updateInput.Password))
        {
            entity.Password = updateInput.Password;
        }
    }

    private static void EnsureNotSystemOwnerAccount(string? userName)
    {
        if (HotelSystemOwner.IsUserName(userName))
        {
            throw new UserFriendlyException("لا يمكن إنشاء أو تعديل حساب صاحب النظام من واجهة المستخدمين.");
        }
    }

    private async Task EnsureUserNameAvailableAsync(string userName, int? excludeId = null)
    {
        var normalizedUserName = userName.Trim().ToLowerInvariant();
        if (normalizedUserName.Length == 0)
        {
            return;
        }

        var matches = await repository.GetListAsync(
            x => x.UserName.ToLower() == normalizedUserName &&
                 (!excludeId.HasValue || x.Id != excludeId.Value));

        if (matches.Count > 0)
        {
            throw new UserFriendlyException("اسم المستخدم مستخدم مسبقاً. يرجى اختيار اسم آخر.");
        }
    }

    private static string NormalizeLandingPagePath(string? value)
    {
        var trimmed = (value ?? string.Empty).Trim();
        if (trimmed.Length == 0 || trimmed == "/")
        {
            return "/dashboard";
        }

        var embeddedMatch = System.Text.RegularExpressions.Regex.Match(
            trimmed,
            @"\/?https?:\/\/[^\s]+",
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        if (embeddedMatch.Success)
        {
            trimmed = embeddedMatch.Value.TrimStart('/');
        }

        if (Uri.TryCreate(trimmed, UriKind.Absolute, out var absoluteUri) &&
            (absoluteUri.Scheme == Uri.UriSchemeHttp || absoluteUri.Scheme == Uri.UriSchemeHttps))
        {
            trimmed = absoluteUri.PathAndQuery;
        }

        if (trimmed.StartsWith("/http://", StringComparison.OrdinalIgnoreCase) ||
            trimmed.StartsWith("/https://", StringComparison.OrdinalIgnoreCase))
        {
            if (Uri.TryCreate(trimmed[1..], UriKind.Absolute, out var nestedUri))
            {
                trimmed = nestedUri.PathAndQuery;
            }
            else
            {
                return "/dashboard";
            }
        }

        var withSlash = trimmed.StartsWith('/') ? trimmed : $"/{trimmed}";
        var qIndex = withSlash.IndexOf('?');
        var pathPart = qIndex >= 0 ? withSlash[..qIndex] : withSlash;
        var query = qIndex >= 0 ? withSlash[(qIndex + 1)..] : string.Empty;
        var path = pathPart.TrimEnd('/');
        if (path.Length == 0)
        {
            path = "/";
        }

        return query.Length > 0 ? $"{path}?{query}" : path;
    }
}
